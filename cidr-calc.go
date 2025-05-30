package main

import (
	"fmt"
	"net"
)

func main() {
	cidr := "10.0.1.0/26"
	_, ipnet, err := net.ParseCIDR(cidr)
	if err != nil {
		panic(err)
	}

	// Get first and last usable IP
	var ips []net.IP
	for ip := ipnet.IP.Mask(ipnet.Mask); ipnet.Contains(ip); inc(ip) {
		ipCopy := make(net.IP, len(ip))
		copy(ipCopy, ip)
		ips = append(ips, ipCopy)
	}

	fmt.Println("CIDR:", cidr)
	fmt.Println("Network Address:", ips[0])
	fmt.Println("First Host:", ips[1])
	fmt.Println("Last Host:", ips[len(ips)-2])
	fmt.Println("Broadcast Address:", ips[len(ips)-1])
	fmt.Printf("Number of Hosts: %d\n", len(ips)-2)
}

func inc(ip net.IP) {
	for j := len(ip) - 1; j >= 0; j-- {
		ip[j]++
		if ip[j] > 0 {
			break
		}
	}
}
