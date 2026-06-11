const fs = require('fs')
const path = require('path')

const TARGET_DIRS = [
  'app/admin',
  'app/dashboard',
  'app/promoter',
  'app/learn'
]

const UI_TOKENS = ['bg-dark', 'bg-dark-100', 'bg-dark-200', 'text-gray-400', 'border-white/10']
const FUNC_TOKENS = ['href="#"', 'catch (e) {', 'catch(e) {', 'catch (error) {', 'catch(error) {']

const uiReport = {}
const funcReport = {
  deadLinks: [],
  silentCatches: []
}

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return
  const files = fs.readdirSync(dirPath)

  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      scanDir(fullPath)
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      scanFile(fullPath)
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  let currentFileUiMatches = []
  
  lines.forEach((line, index) => {
    // UI Audit
    UI_TOKENS.forEach(token => {
      if (line.includes(token)) {
        currentFileUiMatches.push({ line: index + 1, match: token, content: line.trim() })
      }
    })

    // Functionality Audit - Dead Links
    if (line.includes('href="#"')) {
      funcReport.deadLinks.push({ file: filePath, line: index + 1, content: line.trim() })
    }

    // Functionality Audit - Silent Catch
    if (line.match(/catch\s*\([^)]*\)\s*\{\s*\}/) || (line.includes('catch') && !content.substring(content.indexOf(line), content.indexOf(line) + 200).includes('showError') && !content.substring(content.indexOf(line), content.indexOf(line) + 200).includes('alert') && !content.substring(content.indexOf(line), content.indexOf(line) + 200).includes('console.error'))) {
       // Too complex for simple regex, let's just check for empty catches
       if (line.match(/catch\s*\([^)]*\)\s*\{\s*\}/) || content.substring(content.indexOf(line), content.indexOf(line) + 20).replace(/\s/g, '').includes('catch(e){}')) {
           funcReport.silentCatches.push({ file: filePath, line: index + 1 })
       }
    }
  })

  if (currentFileUiMatches.length > 0) {
    uiReport[filePath] = currentFileUiMatches
  }
}

function runAudit() {
  console.log('Running static audit...')
  
  TARGET_DIRS.forEach(dir => {
    scanDir(path.join(process.cwd(), dir))
  })

  // Format UI Report
  let uiReportMd = '# UI Audit - Dark Theme Remnants\n\n'
  for (const [file, matches] of Object.entries(uiReport)) {
    uiReportMd += `### ${file}\n`
    matches.forEach(m => {
      uiReportMd += `- Line ${m.line}: Found \`${m.match}\` -> \`${m.content}\`\n`
    })
    uiReportMd += '\n'
  }

  // Format Func Report
  let funcReportMd = '# Functionality Audit\n\n'
  funcReportMd += '## Dead Links\n'
  if (funcReport.deadLinks.length === 0) funcReportMd += 'None found.\n'
  funcReport.deadLinks.forEach(m => {
    funcReportMd += `- \`${m.file}\` Line ${m.line}: ${m.content}\n`
  })

  funcReportMd += '\n## Empty/Silent Catch Blocks\n'
  if (funcReport.silentCatches.length === 0) funcReportMd += 'None found.\n'
  funcReport.silentCatches.forEach(m => {
    funcReportMd += `- \`${m.file}\` Line ${m.line}\n`
  })

  fs.writeFileSync('ui_audit_report.md', uiReportMd)
  fs.writeFileSync('func_audit_report.md', funcReportMd)
  console.log('Audit complete. Reports saved to ui_audit_report.md and func_audit_report.md')
}

runAudit()
