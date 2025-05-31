// Gemini API 관련 코드를 작성

export const geminiApi = {
  async sendMessage(userInput) {
    try {
      const response = await fetch('http://localhost:4000/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.reply || '응답을 이해하지 못했어요.';
    } catch (error) {
      console.error('Gemini API 요청 실패:', error);
      throw new Error('Gemini LLM 응답을 가져오는 데 실패했어요. 서버가 실행 중인지 확인해주세요.');
    }
  }
};