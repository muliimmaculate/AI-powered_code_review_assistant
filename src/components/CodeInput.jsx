interface CodeInputProps {
  onAnalyze: () => void;
  isAnalyzing?: boolean;
  code: string;
  setCode: (code: string) => void;
  isProjectMode?: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = (props) => {
  const { code, setCode, isAnalyzing = false, onAnalyze, isProjectMode = false } = props;
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      setCode(text);
    } catch (error) {
      console.error('Error reading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Code className="w-6 h-6 mr-2 text-blue-600" />
            Code Input
          </h2>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload File</span>
              <input
                type="file"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.clj,.hs,.ml,.fs,.vb,.pl,.sh,.sql,.html,.css,.json,.xml,.yaml,.yml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here or upload a file..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          disabled={isUploading}
        />
        
        {isUploading && (
          <div className="mt-2 flex items-center text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Processing file...</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onAnalyze}
          disabled={(!code && !isProjectMode) || isAnalyzing || isUploading}
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
      </div>
    </div>
  );
};