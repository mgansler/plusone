import { execSync } from 'child_process'

// Get changed files
const stagedFiles: string[] = execSync('git diff --name-only --cached').toString().split(/\n/).filter(Boolean)

// Format files
execSync(`yarn nx format --files ${stagedFiles.join(',')}`)

const unstagedFiles: string[] = execSync('git diff --name-only').toString().split(/\n/).filter(Boolean)

for (const stagedFile of stagedFiles) {
  if (unstagedFiles.includes(stagedFile)) {
    execSync(`git add ${stagedFile}`)
  }
}
