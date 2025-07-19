@@ .. @@
 const AnalysisResults = ({ analysis, isLoading }) => {
   const [selectedCategory, setSelectedCategory] = useState('all')
   const [selectedSeverity, setSelectedSeverity] = useState('all')
+  const [showDetails, setShowDetails] = useState(true)
 
-  if (isLoading) {
+  if (isLoading || !analysis) {
     return (
       <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
         <div className="flex items-center justify-center py-12">
           <div className="text-center">
             <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
-            <p className="text-gray-600 dark:text-gray-400">Analyzing your code...</p>
+            <p className="text-gray-600 dark:text-gray-400">
+              {isLoading ? 'Analyzing your code...' : 'No analysis results yet'}
+            </p>
           </div>
         </div>
       </div>
     )
   }
 
-  if (!analysis) {
+  if (!analysis.summary && !analysis.issues) {
     return (
       <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
         <div className="text-center py-12">
           <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
-            No Analysis Yet
+            Ready to Analyze
           </h3>
           <p className="text-gray-600 dark:text-gray-400">
-            Upload code or paste it in the editor to get started
+            Click "Analyze Code" to get detailed insights about your code
           </p>
         </div>
       </div>
@@ .. @@
   return (
     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
       {/* Header with Score */}
-      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
+      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
         <div className="flex items-center justify-between">
           <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
               Analysis Results
             </h2>
-            <p className="text-gray-600 dark:text-gray-400">
-              {analysis.language} • {analysis.issues?.length || 0} issues found
+            <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-4">
+              <span>{analysis.language} Analysis</span>
+              <span>•</span>
+              <span>{analysis.issues?.length || 0} issues found</span>
+              <span>•</span>
+              <span>{analysis.metrics?.linesOfCode || 0} lines of code</span>
             </p>
           </div>
           <div className="text-right">
@@ -88,6 +96,16 @@ const AnalysisResults = ({ analysis, isLoading }) => {
         </div>
       </div>
 
+      {/* Quick Stats */}
+      <div className="p-6 bg-gray-50 dark:bg-gray-700/50">
+        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
+          {Object.entries(severityStats).map(([severity, count]) => (
+            <div key={severity} className="text-center">
+              <div className={`text-2xl font-bold ${getSeverityColor(severity)}`}>{count}</div>
+              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{severity}</div>
+            </div>
+          ))}
+        </div>
+      </div>
+
       {/* Filters */}
       <div className="p-6 border-b border-gray-200 dark:border-gray-700">
         <div className="flex flex-wrap gap-4">
@@ -130,7 +148,7 @@ const AnalysisResults = ({ analysis, isLoading }) => {
       </div>
 
       {/* Issues List */}
-      <div className="p-6">
+      <div className="p-6 max-h-96 overflow-y-auto">
         {filteredIssues.length === 0 ? (
           <div className="text-center py-8">
             <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
@@ -142,7 +160,7 @@ const AnalysisResults = ({ analysis, isLoading }) => {
         ) : (
           <div className="space-y-4">
             {filteredIssues.map((issue, index) => (
-              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
+              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                 <div className="flex items-start justify-between mb-2">
                   <div className="flex-1">
                     <div className="flex items-center space-x-2 mb-1">
@@ -175,6 +193,12 @@ const AnalysisResults = ({ analysis, isLoading }) => {
                   </div>
                 </div>
 
+                {issue.line && (
+                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
+                    Line {issue.line}: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{issue.code}</code>
+                  </div>
+                )}
+
                 <p className="text-gray-700 dark:text-gray-300 mb-3">
                   {issue.description}
                 </p>
@@ -184,6 +208,15 @@ const AnalysisResults = ({ analysis, isLoading }) => {
                     <p className="text-sm text-blue-600 dark:text-blue-400">{issue.suggestion}</p>
                   </div>
                 )}
+
+                {issue.fixedCode && (
+                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
+                    <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Suggested Fix:</p>
+                    <pre className="text-xs bg-green-100 dark:bg-green-900/40 p-2 rounded overflow-x-auto">
+                      <code>{issue.fixedCode}</code>
+                    </pre>
+                  </div>
+                )}
               </div>
             ))}
           </div>