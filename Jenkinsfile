pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/Nishasaran1006/Load-Security-Testing-Demo.git'
            }
        }

        stage('Setup') {
            steps {
                sh 'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -'
                sh 'sudo apt-get install -y nodejs'
                sh 'npm install'
                sh 'sudo apt-get update'
                sh 'sudo apt-get install -y k6'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm run test-all'
            }
        }
    }

    post {
        always {
            // Publish JUnit XML results
            junit 'Reports/*.xml'

            // Publish HTML reports
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'Reports',
                reportFiles: 'security-report.html,load-report.html',
                reportName: 'Test Reports'
            ])

            // Archive all reports
            archiveArtifacts artifacts: 'Reports/*', allowEmptyArchive: true
        }
    }
}