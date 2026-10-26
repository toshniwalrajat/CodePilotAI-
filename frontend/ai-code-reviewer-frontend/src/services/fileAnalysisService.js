import api from "./api";

const fileAnalysisService = {
  async analyzeFile(file, analysisType) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("analysisType", analysisType);

    const response = await api.post(
      "/api/analysis/upload",
      formData
    );

    return response.data;
  },
};

export default fileAnalysisService;