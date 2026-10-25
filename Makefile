.PHONY: dev app dmg

# 開発サーバ付きでアプリを起動
dev: node_modules
	npm run tauri dev

# 文章仕立屋.app をビルド (src-tauri/target/release/bundle/macos/)
app: node_modules
	npm run tauri build -- --bundles app

# 文章仕立屋 の .dmg をビルド (src-tauri/target/release/bundle/dmg/)
dmg: node_modules
	npm run tauri build -- --bundles dmg

node_modules: package.json
	npm install
	@touch node_modules
