import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as path from 'path'
import * as fs from 'fs'
import {ExecOptions} from '@actions/exec/lib/interfaces'

export async function run(): Promise<void> {
  try {
    // VSTest is not a tool we download
    // as Visual Studio is installed on Windows machines
    // However we need to download & use VSWhere to tell us
    // where VSTest is so we can add it that dir to the PATH

    // Triple check it's Windows process
    // Can't install VSWhere.exe for Ubuntu image etc..
    const IS_WINDOWS = process.platform === 'win32'
    if (IS_WINDOWS === false) {
      core.setFailed('VSTest.console.exe only works for Windows.')
      return
    }

    // Try & find tool in cache
    //let directoryToAddToPath: string
    const directoryToAddToPath = tc.find('vswhere', '2.7.1')

    if (directoryToAddToPath) {
      core.debug(
        `Found local cached tool at ${directoryToAddToPath} adding that to path`
      )

      const VSTestPath = await FindVSTest(directoryToAddToPath)
      core.debug(`VSTestPath == ${VSTestPath}`)

      // Add folder where VSTest lives to the PATH
      core.addPath(VSTestPath)
      return
    }

    // Download VSWhere 2.7.1 release
    core.debug('Downloading VSWhere v2.7.1 tool')
    const vsWherePath = await tc.downloadTool(
      'https://github.com/microsoft/vswhere/releases/download/2.7.1/vswhere.exe'
    )

    // Rename the file which is a GUID without extension
    const folder = path.dirname(vsWherePath)
    const fullPath = path.join(folder, 'vswhere.exe')
    fs.renameSync(vsWherePath, fullPath)

    //Cache the directory with VSWhere in it - which returns a NEW cached location
    const cachedToolDir = await tc.cacheDir(folder, 'vswhere', '2.7.1')
    core.debug(`Cached Tool Dir ${cachedToolDir}`)

    const VSTestPath = await FindVSTest(cachedToolDir)
    core.debug(`VSTestPath == ${VSTestPath}`)

    // Add folder where VSTest lives to the PATH
    core.addPath(VSTestPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

export async function FindVSTest(pathToVSWhere: string): Promise<string> {
  let vsTestPath = ''

  const options: ExecOptions = {}
  options.listeners = {
    stdout: (data: Buffer) => {
      const output = data.toString()
      vsTestPath += output
    }
  }

  // Run VSWhere to tell us where VSTest is
  const vsWhereExe = path.join(pathToVSWhere, 'vswhere.exe')
  await exec.exec(
    vsWhereExe,
    ['-latest', '-property', 'installationPath'],
    options
  )

  if (vsTestPath === '') {
    core.setFailed('Unable to find VSTest.console.exe')
  }
  const folderForVSTest = `${vsTestPath.trim()}\\Common7\\IDE\\CommonExtensions\\Microsoft\\TestWindow`
  core.debug(`VSTest = ${vsTestPath.trim()}`)
  core.debug(`Folder for VSTest ${folderForVSTest}`)

  return folderForVSTest
}
