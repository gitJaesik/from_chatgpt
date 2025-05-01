package main

import (
	"fmt"
	"sort"
)

func main() {
	items := []interface{}{42, "apple", 3.14, "banana", 1}

	// 정렬 기준 정의
	sort.Slice(items, func(i, j int) bool {
		// string 먼저, 그 다음 숫자 정렬
		switch vi := items[i].(type) {
		case string:
			if vj, ok := items[j].(string); ok {
				return vi < vj
			}
			return true // string < number
		case int:
			switch vj := items[j].(type) {
			case string:
				return false // int > string
			case int:
				return vi < vj
			case float64:
				return float64(vi) < vj
			}
		case float64:
			switch vj := items[j].(type) {
			case string:
				return false
			case int:
				return vi < float64(vj)
			case float64:
				return vi < vj
			}
		}
		return false
	})

	for _, v := range items {
		fmt.Println(v)
	}
}
