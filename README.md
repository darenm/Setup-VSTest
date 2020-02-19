<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>


# Setup-VSTest

**Many thanks Warren Buckley for his [Setup-MSBuild](https://github.com/warrenbuckley/Setup-MSBuild) action which serves as the basis for this action.**

This action sets up VSTest.console.exe as a CLI tool for use in actions by:
- optionally downloading and caching a version of VSWhere.exe to help find the latest VSTest.console.exe on the machine
- Adds the location of the VSTest.console.exe to the PATH


# Usage

Basic:
```yaml
name: CI UWP

on: [push]

jobs:
  build:

    runs-on: windows-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Setup MSBuild Path
      uses: warrenbuckley/Setup-MSBuild@v1

    - name: Setup VSTest Path
      uses: darenm/Setup-VSTest@v1

    - name: Setup NuGet
      uses: NuGet/setup-nuget@v1.0.2

    - name: Restore packages
      run: msbuild .\dev\CustomMayd.Services.Serialization\CustomMayd.Services.Serialization.sln -t:restore

    - name: Debug Build UWP app
      run: msbuild .\dev\CustomMayd.Services.Serialization\CustomMayd.Services.Serialization.sln /p:Configuration=Debug /p:AppxBundlePlatforms="x86|x64|ARM" /p:AppxPackageDir=".\AppxPackages" /p:AppxBundle=Always /p:UapAppxPackageBuildMode=StoreUpload
      
    - name: VSTest
      run: vstest.console.exe /Platform:x64 .\test\CustomMayd.Services.Serialization.Tests\AppxPackages\CustomMayd.Services.Serialization.Tests_1.0.0.0_Debug_Test\CustomMayd.Services.Serialization.Tests_1.0.0.0_x86_Debug.appx



```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

