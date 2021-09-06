import { exec } from 'shelljs'

export const checkSpaceRoute = async (req, res) => {
  const child = exec('df -H', { async: true })

  child.stdout.on('data', (code, stdout, stderr) => {
    // console.log('Exit code:', code);
    // console.log('Program output:', stdout);
    // console.log('Program stderr:', stderr);

    res.json({ ok: true, code, stdout, stderr })
  })
}