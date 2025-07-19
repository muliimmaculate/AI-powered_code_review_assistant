@@ .. @@
         <button
           onClick={onAnalyze}
-          disabled={!code || isAnalyzing || isUploading}
+          disabled={(!code && !isProjectMode) || isAnalyzing || isUploading}
           className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
         >
           {isAnalyzing ? (
             <Loader2 className="w-5 h-5 animate-spin" />
           ) : (
             <Play className="w-5 h-5" />
           )}
           <span className="font-medium">
             {isAnalyzing ? 'Analyzing...' : isUploading ? 'Processing...' : 'Analyze Code'}
           </span>
         </button>