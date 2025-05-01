```go
package main

import (
	"fmt"
	"github.com/sethvargo/go-diceware/diceware"
)

func main() {
	list, _ := diceware.NewWordList()
	words, _ := diceware.Generate(3, list) // 3단어 조합
	password := fmt.Sprintf("%s_%d", words.Join(""), diceware.MustRandInt(10, 99))

	fmt.Println("Generated password:", password)
}
```

```go
package main

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

// 샘플 단어 목록 (원하면 확장 가능)
var words = []string{
	"blue", "tiger", "sky", "code", "rock", "fast", "moon", "light", "dream", "wave",
}

// 기호 목록
var symbols = []string{"!", "@", "#", "$", "%", "&"}

func GeneratePassword() string {
	rand.Seed(time.Now().UnixNano())

	w1 := strings.Title(words[rand.Intn(len(words))])
	w2 := strings.Title(words[rand.Intn(len(words))])
	num := rand.Intn(90) + 10 // 10~99
	sym := symbols[rand.Intn(len(symbols))]

	return fmt.Sprintf("%s%s%d%s", w1, w2, num, sym)
}

func main() {
	fmt.Println("Generated password:", GeneratePassword())
}
```
