provider "aws" {
  region = "us-west-2"  # 사용하고자 하는 AWS 리전으로 변경하세요.
}

resource "aws_vpc" "ecs_vpc" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "ecs_subnet" {
  vpc_id            = aws_vpc.ecs_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-west-2a"
}

resource "aws_ecs_cluster" "ecs_cluster" {
  name = "ecs-cluster"
}

resource "aws_launch_configuration" "ecs_instance" {
  name          = "ecs-instance"
  image_id      = "ami-xxxxxxxx"  # GPU 인스턴스용 AMI ID로 변경하세요.
  instance_type = "p3.2xlarge"  # 필요한 GPU 인스턴스 타입으로 변경하세요.

  lifecycle {
    create_before_destroy = true
  }

  iam_instance_profile = aws_iam_instance_profile.ecs_instance_profile.name

  user_data = <<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.ecs_cluster.name} >> /etc/ecs/ecs.config
              EOF

  security_groups = [aws_security_group.ecs_security_group.id]
}

resource "aws_autoscaling_group" "ecs_asg" {
  launch_configuration = aws_launch_configuration.ecs_instance.name
  min_size             = 1
  max_size             = 1
  desired_capacity     = 1
  vpc_zone_identifier  = [aws_subnet.ecs_subnet.id]

  tag {
    key                 = "Name"
    value               = "ecs-instance"
    propagate_at_launch = true
  }
}

resource "aws_security_group" "ecs_security_group" {
  vpc_id = aws_vpc.ecs_vpc.id

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_task_definition" "gpu_task" {
  family                   = "gpu-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = <<DEFINITION
[
  {
    "name": "gpu-container",
    "image": "${aws_ecr_repository.your_ecr_repository.repository_url}:latest",
    "essential": true,
    "memory": 512,
    "cpu": 256,
    "resourceRequirements": [
      {
        "type": "GPU",
        "value": "1"
      }
    ],
    "networkMode": "awsvpc"
  }
]
DEFINITION
}

resource "aws_ecr_repository" "your_ecr_repository" {
  name = "your-ecr-repository"
}

resource "aws_ecs_service" "gpu_service" {
  name            = "gpu-service"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.gpu_task.arn
  desired_count   = 1
  launch_type     = "EC2"
  network_configuration {
    subnets         = [aws_subnet.ecs_subnet.id]
    assign_public_ip = true
  }

  depends_on = [aws_autoscaling_group.ecs_asg]
}

resource "aws_iam_role" "ecs_instance_role" {
  name = "ecsInstanceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecsInstanceProfile"
  role = aws_iam_role.ecs_instance_role.name
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

