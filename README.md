# openai-translation

OpenAI Text Translation Tool是一个基于OpenAI API构建的文本翻译工具，使用简单。它可以自动翻译HTML页面中的所有`<p>`段落，并将结果显示在新的段落下方。如果某个段落为空格，则该段落将被跳过。这个工具适用于需要快速翻译HTML页面内容的场景，欢迎使用和贡献代码。

## 工作原理

就是非常简单地调用OpenAI API，将HTML页面中的所有`<p>`段落作为输入，然后将结果显示在新的段落下方。如果某个段落为空格，则该段落将被跳过。

[OpenAI API](https://beta.openai.com/docs/api-reference/translate)的使用方法请参考官方文档。

[github](https://github.com/)下的网页不好使，有无大佬能来解决一下？

## 使用方法

1. 在[OpenAI API](https://beta.openai.com/docs/api-reference/translate)注册账号，获取API Key。
2. 复制`temper-monkey.js`中的代码，粘贴到`Tampermonkey`的新建脚本中。
3. 第一次使用时需要输入API Key, 以及选择翻译的语言，之后会自动保存。

## 警告

使用该工具需要遵守 OpenAI API 的使用条款和条件。本工具仅供个人学习和研究使用，不得用于商业用途。使用该工具所造成的一切后果由使用者自行承担。
