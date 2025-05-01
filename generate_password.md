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
	"apple", "blue", "cloud", "dream", "echo", "flame", "grape", "hill", "ice", "jazz",
	"kite", "light", "moon", "note", "ocean", "pearl", "quick", "rock", "sun", "tree",
	"ultra", "vibe", "wave", "xray", "yarn", "zebra", "ant", "breeze", "charm", "dawn",
	"ember", "frost", "glow", "honey", "iris", "joy", "kite", "leaf", "mint", "nest",
	"oak", "plum", "quilt", "rain", "star", "twist", "unity", "valley", "wind", "zen",
	"acorn", "bloom", "candy", "drift", "elm", "fairy", "gem", "haze", "isle", "jade",
	"koala", "luna", "moss", "nova", "orb", "petal", "quest", "rose", "sky", "tide",
	"under", "vivid", "wish", "xerox", "young", "zest", "amber", "beach", "crisp", "dune",
	"echo", "fizz", "glide", "heart", "ink", "jewel", "karma", "lily", "mist", "nestle",
	"owl", "pine", "quasar", "reef", "spark", "topaz", "unit", "veil", "whale", "zenith",
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
