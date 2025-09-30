const { spawn } = require('child_process');
const path = require('path');

exports.runPy = (scriptRelPath, args = []) =>
  new Promise((resolve, reject) => {
    try {
      // Use absolute path from the backend directory
      const script = path.resolve(__dirname, scriptRelPath);
      console.log(`🐍 Executing Python script: ${script}`);
      console.log(`🐍 Arguments: ${args.join(', ')}`);
      console.log(`🐍 Current working directory: ${process.cwd()}`);
      console.log(`🐍 Script exists: ${require('fs').existsSync(script)}`);
      
      // Check if Python is available
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      console.log(`🐍 Using Python command: ${pythonCommand}`);
      
      const p = spawn(pythonCommand, [script, ...args], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        cwd: __dirname, // Set working directory to utils folder
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      p.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`🐍 Python stdout: ${data.toString().trim()}`);
      });
      
      p.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`🐍 Python stderr: ${data.toString().trim()}`);
      });
      
      p.on('close', (code) => {
        console.log(`🐍 Python process closed with code: ${code}`);
        if (code === 0) {
          console.log(`✅ Python script executed successfully with code ${code}`);
          resolve(stdout);
        } else {
          const errorMsg = stderr || `Python script exited with code ${code}`;
          console.error(`❌ Python script failed with code ${code}: ${errorMsg}`);
          console.error(`❌ Python stdout: ${stdout}`);
          console.error(`❌ Python stderr: ${stderr}`);
          reject(new Error(errorMsg));
        }
      });
      
      p.on('error', (error) => {
        console.error(`❌ Failed to start Python process: ${error.message}`);
        console.error(`❌ Python process error details:`, {
          message: error.message,
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          path: error.path
        });
        reject(error);
      });
      
      // Add timeout
      const timeout = setTimeout(() => {
        console.error(`❌ Python script execution timed out after 30 seconds`);
        p.kill();
        reject(new Error('Python script execution timed out after 30 seconds'));
      }, 30000);
      
      p.on('close', (code) => {
        clearTimeout(timeout);
        console.log(`🐍 Python process closed with code: ${code}`);
        if (code === 0) {
          console.log(`✅ Python script executed successfully with code ${code}`);
          resolve(stdout);
        } else {
          const errorMsg = stderr || `Python script exited with code ${code}`;
          console.error(`❌ Python script failed with code ${code}: ${errorMsg}`);
          console.error(`❌ Python stdout: ${stdout}`);
          console.error(`❌ Python stderr: ${stderr}`);
          reject(new Error(errorMsg));
        }
      });
      
    } catch (error) {
      console.error(`❌ Error in runPy: ${error.message}`);
      console.error(`❌ runPy error details:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      reject(error);
    }
  });
