import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AiService {
  async generateSuggestion(ticketDescription: string): Promise<string> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error('🚨 GEMINI_API_KEY não está definida no .env');
        throw new Error('API Key ausente');
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

      const prompt = `
        Você é um assistente de suporte técnico de um Help Desk. 
        O cliente enviou o seguinte problema: "${ticketDescription}".
        Escreva uma sugestão de resposta educada, empática e direta ao ponto para ajudar o cliente. 
        Não inclua saudações genéricas como [Nome do Cliente], retorne apenas o texto da resposta.
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('🚨 Erro direto da API REST do Google:', data);
        throw new Error(data.error?.message || 'Erro desconhecido na API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('🚨 Erro no AiService:', error);
      throw new InternalServerErrorException('Erro ao gerar sugestão com a IA');
    }
  }
}
