from pathlib import Path

root = Path('app')
old = 'navigate("MainTabs", { screen: "خانه" })'
new = 'navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })'

for path in root.rglob('*'):
    if not path.is_file() or path.suffix.lower() not in {'.ts', '.tsx', '.js', '.jsx'}:
        continue
    text = path.read_text(encoding='utf-8')
    if old in text:
        path.write_text(text.replace(old, new), encoding='utf-8')
        print(path.as_posix())
