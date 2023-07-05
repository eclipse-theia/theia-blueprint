/**
 * This Jenkinsfile builds Theia across the major OS platforms
 */
import groovy.json.JsonSlurper

distFolder = "applications/electron/dist"
releaseBranch = "master"
// Attempt to detect that a PR is Jenkins-related, by looking-for 
// the word "jenkins" (case insensitive) in PR branch name and/or 
// the PR title
jenkinsRelatedRegex = "(?i).*jenkins.*"

pipeline {
    agent none
    options {
        timeout(time: 5, unit: 'HOURS')
        disableConcurrentBuilds()
    }
    environment {
        BLUEPRINT_JENKINS_CI = 'true'
    }
    stages {
        stage('Build') {
            // only proceed when merging on the release branch or if the 
            // PR seems Jenkins-related
            when {
                anyOf {
                    expression {
                        env.JOB_BASE_NAME ==~ /$releaseBranch/
                    }
                    expression { 
                        env.CHANGE_BRANCH ==~ /$jenkinsRelatedRegex/ 
                    }
                    expression {
                        env.CHANGE_TITLE ==~ /$jenkinsRelatedRegex/
                    }
                }
            }
            parallel {
                stage('Create Linux Installer') {
                    agent {
                        kubernetes {
                            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: theia-dev
    image: eclipsetheia/theia-blueprint:builder
    imagePullPolicy: Always
    command:
    - cat
    tty: true
    resources:
      limits:
        memory: "8Gi"
        cpu: "2"
      requests:
        memory: "8Gi"
        cpu: "2"
    volumeMounts:
    - name: global-cache
      mountPath: /.cache
    - name: global-yarn
      mountPath: /.yarn      
    - name: global-npm
      mountPath: /.npm      
    - name: electron-cache
      mountPath: /.electron-gyp
  volumes:
  - name: global-cache
    emptyDir: {}
  - name: global-yarn
    emptyDir: {}
  - name: global-npm
    emptyDir: {}
  - name: electron-cache
    emptyDir: {}
"""
                        }
                    }
                    steps {
                        container('theia-dev') {
                            withCredentials([string(credentialsId: "github-bot-token", variable: 'GITHUB_TOKEN')]) {
                                script {
                                    buildInstaller(1200, false)
                                }
                            }
                        }
                        stash includes: "${distFolder}/*", name: 'linux'
                    }
                    post {
                        failure {
                            error("Linux installer creation failed, aborting...")
                        }
                    }
                }
                stage('Create Mac Installer') {
                    agent {
                        label 'macos'
                    }
                    steps {
                        script {
                            buildInstaller(60, false)
                        }
                        stash includes: "${distFolder}/*", name: 'mac'
                    }
                    post {
                        failure {
                            error("Mac installer creation failed, aborting...")
                        }
                    }
                }
                stage('Create Windows Installer') {
                    agent {
                        label 'windows'
                    }
                    steps {
                        script {
                            sh "npm config set msvs_version 2017"
                            sh "npx node-gyp install 14.20.0"

                            // analyze memory usage
                            bat "wmic ComputerSystem get TotalPhysicalMemory"
                            bat "wmic OS get FreePhysicalMemory"
                            bat "tasklist"

                            buildInstaller(60, true)
                        }
                        stash name: 'win'
                    }
                    post {
                        failure {
                            error("Windows installer creation failed, aborting...")
                        }
                    }
                }
            }
        }
        stage('Sign and Upload') {
            // only proceed when merging on the release branch or if the 
            // PR seems Jenkins-related
            when {
                anyOf {
                    expression {
                        env.JOB_BASE_NAME ==~ /$releaseBranch/
                    }
                    expression { 
                        env.CHANGE_BRANCH ==~ /$jenkinsRelatedRegex/ 
                    }
                    expression {
                        env.CHANGE_TITLE ==~ /$jenkinsRelatedRegex/
                    }
                }
            }
            parallel {
                stage('Upload Linux') {
                    agent any
                    steps {
                        unstash 'linux'
                        script {
                            uploadInstaller('linux')
                        }
                    }
                }
                stage('Sign, Notarize and Upload Mac') {
                    agent any
                    steps {
                        unstash 'mac'
                        script {
                            signInstaller('dmg', 'mac')
                            notarizeInstaller('dmg')
                            uploadInstaller('macos')
                        }
                    }
                }
                stage('Sign and Upload Windows') {
                    agent {
                        kubernetes {
                            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: theia-dev
    image: eclipsetheia/theia-blueprint:builder
    imagePullPolicy: Always
    command:
    - cat
    tty: true
    resources:
      limits:
        memory: "8Gi"
        cpu: "2"
      requests:
        memory: "8Gi"
        cpu: "2"
    volumeMounts:
    - name: global-cache
      mountPath: /.cache
    - name: global-yarn
      mountPath: /.yarn      
    - name: global-npm
      mountPath: /.npm      
    - name: electron-cache
      mountPath: /.electron-gyp
  - name: jnlp
    volumeMounts:
    - name: volume-known-hosts
      mountPath: /home/jenkins/.ssh
  volumes:
  - name: global-cache
    emptyDir: {}
  - name: global-yarn
    emptyDir: {}
  - name: global-npm
    emptyDir: {}
  - name: electron-cache
    emptyDir: {}
  - name: volume-known-hosts
    configMap:
      name: known-hosts
"""
                        }
                    }
                    steps {
                        unstash 'win'
                        container('theia-dev') {
                            withCredentials([string(credentialsId: "github-bot-token", variable: 'GITHUB_TOKEN')]) {
                                script {
                                    signInstaller('exe', 'windows')
                                    updateMetadata('TheiaBlueprint.exe', 'latest.yml', 'windows', 1200)
                                }
                            }
                        }
                        container('jnlp') {
                            script {
                                uploadInstaller('windows')
                                copyInstallerAndUpdateLatestYml('windows', 'TheiaBlueprint', 'exe', 'latest.yml', '1.36.0,1.37.0,1.38.0')
                            }
                        }
                    }
                }
            }
        }
    }
}

def buildInstaller(int sleepBetweenRetries, boolean excludeBrowser) {
    int MAX_RETRY = 3

    checkout scm
    if (excludeBrowser) {
        sh "npm install -g ts-node typescript '@types/node'"
        sh "ts-node scripts/patch-workspaces.ts"
    }
    sh "node --version"
    sh "export NODE_OPTIONS=--max_old_space_size=4096"
    sh "printenv && yarn cache dir"
    sh "yarn cache clean"
    try {
        sh(script: 'yarn --frozen-lockfile --force')
    } catch(error) {
        retry(MAX_RETRY) {
            sleep(sleepBetweenRetries)
            echo "yarn failed - Retrying"
            sh(script: 'yarn --frozen-lockfile --force')        
        }
    }

    sh "rm -rf ./${distFolder}"
    sshagent(['projects-storage.eclipse.org-bot-ssh']) {
        sh "yarn electron deploy"
    }
}

def signInstaller(String ext, String os) {
    List installers = findFiles(glob: "${distFolder}/*.${ext}")
    
    // https://wiki.eclipse.org/IT_Infrastructure_Doc#Web_service
    if (os == 'mac') {
        url = 'https://cbi.eclipse.org/macos/codesign/sign'
    } else if (os == 'windows') {
        url = 'https://cbi.eclipse.org/authenticode/sign'
    } else {
        error("Error during signing: unsupported OS: ${os}")
    }

    if (installers.size() == 1) {
        sh "curl -o ${distFolder}/signed-${installers[0].name} -F file=@${installers[0].path} ${url}"
        sh "rm ${installers[0].path}"
        sh "mv ${distFolder}/signed-${installers[0].name} ${installers[0].path}"
    } else {
        error("Error during signing: installer not found or multiple installers exist: ${installers.size()}")
    }
}

def notarizeInstaller(String ext) {
    String service = 'https://cbi.eclipse.org/macos/xcrun'
    List installers = findFiles(glob: "${distFolder}/*.${ext}")

    if (installers.size() == 1) {
        String response = sh(script: "curl -X POST -F file=@${installers[0].path} -F \'options={\"primaryBundleId\": \"eclipse.theia\", \"staple\": true};type=application/json\' ${service}/notarize", returnStdout: true)

        def jsonSlurper = new JsonSlurper()
        def json = jsonSlurper.parseText(response)
        String uuid = json.uuid

        while(json.notarizationStatus.status == 'IN_PROGRESS') {
            sh "sleep 60"
            response = sh(script: "curl ${service}/${uuid}/status", returnStdout: true)
            json = jsonSlurper.parseText(response)
        }

        if (json.notarizationStatus.status != 'COMPLETE') {
            error("Failed to notarize ${installers[0].name}: ${response}")
        }

        sh "curl -o ${distFolder}/stapled-${installers[0].name} ${service}/${uuid}/download"
        sh "rm ${installers[0].path}"
        sh "mv ${distFolder}/stapled-${installers[0].name} ${installers[0].path}"
    } else {
        error("Error during notarization: installer not found or multiple installers exist: ${installers.size()}")
    }
}

def updateMetadata(String executable, String yaml, String platform, int sleepBetweenRetries) {
    int MAX_RETRY = 4
    try {
        sh "export NODE_OPTIONS=--max_old_space_size=4096"
        sh "yarn install --force"
        sh "yarn electron update:blockmap -e ${executable}"
        sh "yarn electron update:checksum -e ${executable} -y ${yaml} -p ${platform}"
    } catch(error) {
        retry(MAX_RETRY) {
            sleep(sleepBetweenRetries)
            echo "yarn failed - Retrying"
            sh "yarn install --force"
            sh "yarn electron update:blockmap -e ${executable}"
            sh "yarn electron update:checksum -e ${executable} -y ${yaml} -p ${platform}"
        }
    }
}

def uploadInstaller(String platform) {
    if (env.BRANCH_NAME == releaseBranch) {
        def packageJSON = readJSON file: "package.json"
        String version = "${packageJSON.version}"
        sshagent(['projects-storage.eclipse.org-bot-ssh']) {
            sh "ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
            sh "ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
            sh "scp ${distFolder}/*.* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
            sh "ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/latest/${platform}"
            sh "ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/latest/${platform}"
            sh "scp ${distFolder}/*.* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/latest/${platform}"
        }
    } else {
        echo "Skipped upload for branch ${env.BRANCH_NAME}"
    }
}

/**
 * Currently we have the windows updater available twice with different names. 
 * We want to have a name without the versions for providing a stable download link. 
 * Due to a bug in the nsis-updater the downloaded exe for an update needs to have a different name than initially however.
 */
def copyInstallerAndUpdateLatestYml(String platform, String installer, String extension, String yaml, String UPDATABLE_VERSIONS) {
    if (env.BRANCH_NAME == releaseBranch) {
        def packageJSON = readJSON file: "package.json"
        String version = "${packageJSON.version}"
        sshagent(['projects-storage.eclipse.org-bot-ssh']) {
            sh "ssh genie.theia@projects-storage.eclipse.org cp /home/data/httpd/download.eclipse.org/theia/latest/${platform}/${installer}.${extension} /home/data/httpd/download.eclipse.org/theia/latest/${platform}/${installer}-${version}.${extension}"
            sh "ssh genie.theia@projects-storage.eclipse.org cp /home/data/httpd/download.eclipse.org/theia/${version}/${platform}/${installer}.${extension} /home/data/httpd/download.eclipse.org/theia/${version}/${platform}/${installer}-${version}.${extension}"
            sh "ssh genie.theia@projects-storage.eclipse.org cp /home/data/httpd/download.eclipse.org/theia/latest/${platform}/${installer}.${extension}.blockmap /home/data/httpd/download.eclipse.org/theia/latest/${platform}/${installer}-${version}.${extension}.blockmap"
            sh "ssh genie.theia@projects-storage.eclipse.org cp /home/data/httpd/download.eclipse.org/theia/${version}/${platform}/${installer}.${extension}.blockmap /home/data/httpd/download.eclipse.org/theia/${version}/${platform}/${installer}-${version}.${extension}.blockmap"
        }
        if (UPDATABLE_VERSIONS.length() != 0) {
            for (oldVersion in UPDATABLE_VERSIONS.split(",")) {
                sshagent(['projects-storage.eclipse.org-bot-ssh']) {
                    sh "ssh genie.theia@projects-storage.eclipse.org rm -f /home/data/httpd/download.eclipse.org/theia/${oldVersion}/${platform}/${yaml}"
                    sh "ssh genie.theia@projects-storage.eclipse.org cp /home/data/httpd/download.eclipse.org/theia/${version}/${platform}/${yaml} /home/data/httpd/download.eclipse.org/theia/${oldVersion}/${platform}/${yaml}"
                }
            }
        } else {
            echo "No updateable versions"
        }

    } else {
        echo "Skipped copying installer for branch ${env.BRANCH_NAME}"
    }
}
