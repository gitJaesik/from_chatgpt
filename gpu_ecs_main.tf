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
    "image": "your-gpu-enabled-image",
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

