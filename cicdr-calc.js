const ip = require("ip");

function calculateCIDR(cidr) {
  if (!ip.isCIDR(cidr)) {
    console.error("Invalid CIDR format");
    return;
  }

  const subnet = ip.cidrSubnet(cidr);

  console.log(`CIDR: ${cidr}`);
  console.log(`Network Address: ${subnet.networkAddress}`);
  console.log(`First Host: ${subnet.firstAddress}`);
  console.log(`Last Host: ${subnet.lastAddress}`);
  console.log(`Broadcast Address: ${subnet.broadcastAddress}`);
  console.log(`Subnet Mask: ${subnet.subnetMask}`);
  console.log(`Number of Hosts: ${subnet.numHosts}`);
}

// 예시 실행
calculateCIDR("10.0.1.0/26");
