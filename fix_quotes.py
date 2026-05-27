import codecs

with codecs.open('frontend/src/data/destinos.ts', 'r', 'utf-8') as f:
    text = f.read()

text = text.replace("'O'Higgins'", "\"O'Higgins\"")
text = text.replace("O'Higgins.'", "O\\'Higgins.'")

with codecs.open('frontend/src/data/destinos.ts', 'w', 'utf-8') as f:
    f.write(text)

print("Fixed quotes")
