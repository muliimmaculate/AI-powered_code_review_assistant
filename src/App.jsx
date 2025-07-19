@@ .. @@
  const [currentView, setCurrentView] = useState('review')
  const [showAIConfig, setShowAIConfig] = useState(false)
  const [aiConfig, setAiConfig] = useState({
    provider: 'local',
    model: 'default',
    analysisDepth: 'standard'
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // GitHub Integration
  const [githubUrl, setGithubUrl] = useState('')
@@ .. @@
  const handleAnalyze = async () => {
    if (!code.trim() && projectFiles.length === 0) {
      alert('Please provide code to analyze or upload files')
      return
    }

    setIsAnalyzing(true)
    
    try {
      let result
      if (isProjectMode && projectFiles.length > 0) {
        result = await analyzeProject(projectFiles, aiConfig)
        setProjectAnalysis(result)
      } else if (code.trim()) {
        const detectedLanguage = detectLanguage(code)
        result = await analyzeCode(code, detectedLanguage, aiConfig)
        setAnalysisResult(result)
      }

      // Add to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        language: isProjectMode ? 'project' : result.language,
        score: result.overallScore || result.summary?.score || 0,
        issueCount: isProjectMode ? result.totalIssues : result.issues?.length || 0,
        codeLength: isProjectMode ? result.totalLines : code.length,
        fileCount: isProjectMode ? result.totalFiles : 1,
        metrics: result.overallMetrics || result.metrics
      }
      setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)])
      
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }
@@ .. @@
            <CodeInput 
              onAnalyze={handleAnalyze} 
              isAnalyzing={isAnalyzing}
              code={code}
              setCode={setCode}
              isProjectMode={isProjectMode}
            />
          </div>
        )}
@@ .. @@
          {currentView === 'review' && (
            <AnalysisResults 
              analysis={isProjectMode ? projectAnalysis : analysisResult}
              isLoading={isAnalyzing}
            />
          )}