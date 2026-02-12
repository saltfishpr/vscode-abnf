import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // VS Code 扩展开发路径
    const extensionDevelopmentPath = path.resolve(__dirname, '../');

    // 测试脚本路径
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // 下载 VS Code 并运行测试
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
