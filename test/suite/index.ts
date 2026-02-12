import { glob } from 'glob';
import Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void> {
  // 创建 Mocha 实例
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 10000, // 集成测试需要更长时间
  });

  const testsRoot = path.resolve(__dirname);

  return new Promise<void>((resolve, reject) => {
    // 查找所有测试文件
    glob('**/*.test.js', { cwd: testsRoot })
      .then((files: string[]) => {
        // 添加测试文件到 mocha
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // 运行测试
          mocha.run((failures: number) => {
            if (failures > 0) {
              reject(new Error(`${failures} tests failed.`));
            } else {
              resolve();
            }
          });
        } catch (err) {
          console.error(err);
          reject(err);
        }
      })
      .catch((err: Error) => reject(err));
  });
}
