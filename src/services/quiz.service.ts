import { Injectable, signal, computed } from '@angular/core';
import { GoogleGenAI, Type, Chat, Content } from "@google/genai";

export interface Question {
  id: number;
  text: string;
  category: 'O' | 'C' | 'E' | 'A' | 'N';
}

export interface QuizResult {
  scores: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  aiAnalysis?: AIAnalysis;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AIAnalysis {
  title: string;
  summary: string;
  work_style: string;
  relationship_style: string;
  life_analysis: {
    finance: string;
    health: string;
    stress: string;
    learning: string;
  };
  strengths: string[];
  weaknesses: string[];
  advice: string[];
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  readonly questions: Question[] = this.getQuestions();

  // State signals
  currentScreen = signal<'welcome' | 'quiz' | 'results'>('welcome');
  currentQuestionIndex = signal<number>(0);
  answers = signal<Record<number, number>>({});
  isLoadingAI = signal<boolean>(false);
  aiResult = signal<AIAnalysis | null>(null);

  // Chat State
  chatSession: Chat | null = null;
  chatMessages = signal<ChatMessage[]>([]);
  isChatLoading = signal<boolean>(false);

  // Lock to prevent double-clicking/race conditions
  isTransitioning = signal<boolean>(false);

  // Computed
  progress = computed(() => {
    return Math.round(((this.currentQuestionIndex() + 1) / this.questions.length) * 100);
  });

  isQuizComplete = computed(() => {
    return Object.keys(this.answers()).length === this.questions.length;
  });

  scores = computed(() => {
    const ans = this.answers();
    const result = { O: 0, C: 0, E: 0, A: 0, N: 0 };

    // Calculate raw sums
    this.questions.forEach(q => {
      const score = ans[q.id] || 0;
      result[q.category] += score;
    });

    // Convert to percentage: (Sum / 12) * 20
    return {
      O: Math.round((result.O / 12) * 20),
      C: Math.round((result.C / 12) * 20),
      E: Math.round((result.E / 12) * 20),
      A: Math.round((result.A / 12) * 20),
      N: Math.round((result.N / 12) * 20),
    };
  });

  startQuiz() {
    this.currentScreen.set('quiz');
    this.currentQuestionIndex.set(0);
    this.answers.set({});
    this.aiResult.set(null);
    this.chatSession = null;
    this.chatMessages.set([]);
    this.isTransitioning.set(false);
  }

  answerQuestion(score: number) {
    if (this.isTransitioning()) return;

    const currentIndex = this.currentQuestionIndex();
    if (currentIndex >= this.questions.length) return;

    const currentQ = this.questions[currentIndex];

    this.answers.update(prev => ({
      ...prev,
      [currentQ.id]: score
    }));

    if (currentIndex < this.questions.length - 1) {
      this.isTransitioning.set(true);
      setTimeout(() => {
        this.currentQuestionIndex.update(i => i + 1);
        this.isTransitioning.set(false);
      }, 250);
    } else {
      this.finishQuiz();
    }
  }

  async finishQuiz() {
    this.currentScreen.set('results');
    await this.generateAIAnalysis();
  }

  // --- AI ANALYSIS GENERATION ---
  async generateAIAnalysis() {
    this.isLoadingAI.set(true);
    const s = this.scores();

    try {
      const ai = new GoogleGenAI({ apiKey: 'AIzaSyDULjtx1B06p-EdUFDJJKmNP37NiONnqpI' });

      const prompt = `
        DỮ LIỆU ĐẦU VÀO (BIG FIVE PROFILE):
        - Openness (Sáng tạo/Trải nghiệm): ${s.O}%
        - Conscientiousness (Tận tâm/Kỷ luật): ${s.C}%
        - Extraversion (Hướng ngoại/Năng lượng): ${s.E}%
        - Agreeableness (Dễ chịu/Hòa đồng): ${s.A}%
        - Neuroticism (Bất ổn cảm xúc/Nhạy cảm): ${s.N}%

        YÊU CẦU PHÂN TÍCH CAO CẤP:
        1. QUY ĐỊNH VỀ NỘI DUNG:
           - Viết dồi dào, sâu sắc (>300 từ cho Summary, > 200 từ cho các mục khác).
           - Phân tích sự kết hợp giữa các chỉ số (VD: E cao + N cao).
           - Giọng văn chuyên gia nhưng giàu cảm xúc (Xưng hô "bạn").

        2. QUY ĐỊNH VỀ HÌNH THỨC (QUAN TRỌNG):
           - Hãy sử dụng định dạng **in đậm** (dấu sao đôi) cho các từ khóa quan trọng, các cụm từ đắt giá, hoặc các tính từ mạnh mô tả tính cách. 
           - Ví dụ: "Bạn là một người **đầy nhiệt huyết** nhưng đôi khi lại **dễ bị tổn thương**."
           - Hãy bôi đậm ít nhất 3-5 cụm từ trong mỗi đoạn văn để tạo điểm nhấn.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên gia tâm lý học hành vi. Nhiệm vụ của bạn là viết báo cáo phân tích tính cách chi tiết. Hãy sử dụng Markdown bold (**text**) để nhấn mạnh các đặc điểm quan trọng.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              work_style: { type: Type.STRING },
              relationship_style: { type: Type.STRING },
              life_analysis: {
                type: Type.OBJECT,
                properties: {
                  finance: { type: Type.STRING },
                  health: { type: Type.STRING },
                  stress: { type: Type.STRING },
                  learning: { type: Type.STRING }
                },
                propertyOrdering: ["finance", "health", "stress", "learning"]
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              advice: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            propertyOrdering: ["title", "summary", "work_style", "relationship_style", "life_analysis", "strengths", "weaknesses", "advice"]
          }
        }
      });

      const text = response.text;
      if (text) {
        this.aiResult.set(JSON.parse(text));
        // Initialize chat context immediately after analysis is ready
        this.initializeChatSession();
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      this.aiResult.set(this.getFallbackData());
    } finally {
      this.isLoadingAI.set(false);
    }
  }

  // --- CHAT FUNCTIONALITY ---
  private initializeChatSession() {
    const s = this.scores();
    const analysis = this.aiResult();
    const context = `
      CONTEXT:
      Người dùng này vừa hoàn thành bài trắc nghiệm Big Five.
      Điểm số: O=${s.O}%, C=${s.C}%, E=${s.E}%, A=${s.A}%, N=${s.N}%.
      Kết quả phân tích tóm tắt: ${analysis?.summary}
      Điểm mạnh: ${analysis?.strengths.join(', ')}
      Điểm yếu: ${analysis?.weaknesses.join(', ')}
      Lời khuyên: ${analysis?.advice.join(', ')}

      NHIỆM VỤ CỦA BẠN:
      Bạn là một "Người bạn tâm giao AI" (AI Soulmate) và Chuyên gia tâm lý.
      Hãy trò chuyện với người dùng về kết quả của họ.
      
      QUAN TRỌNG:
      - Hãy trả lời tự nhiên, chi tiết và có chiều sâu. Đừng trả lời quá ngắn gọn hay hời hợt.
      - Nếu người dùng hỏi về vấn đề phức tạp, hãy giải thích cặn kẽ.
      - Luôn bám sát vào điểm số Big Five để đưa ra lời khuyên cá nhân hóa (Ví dụ: "Vì chỉ số N của bạn cao, bạn nên...").
      - Giọng điệu: Thấu hiểu, ấm áp, chuyên nghiệp nhưng gần gũi.
      - Bạn KHÔNG cần phải in đậm (bold) quá nhiều, chỉ in đậm khi thực sự cần nhấn mạnh ý chính.
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: 'AIzaSyDULjtx1B06p-EdUFDJJKmNP37NiONnqpI' });
      this.chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: context,
        }
      });

      // Add initial greeting from AI
      this.chatMessages.set([{
        role: 'model',
        text: `Chào bạn! Tớ là AI đồng hành cùng bạn đây. Hồ sơ **${analysis?.title}** của bạn thú vị quá! Bạn có muốn hỏi thêm gì về **điểm mạnh** hay cách **cải thiện điểm yếu** của mình không?`
      }]);
    } catch (e) {
      console.error("Chat init failed", e);
    }
  }

  async sendChatMessage(userMessage: string) {
    if (!this.chatSession || !userMessage.trim()) return;

    // 1. Add user message to UI
    this.chatMessages.update(msgs => [...msgs, { role: 'user', text: userMessage }]);
    this.isChatLoading.set(true);

    try {
      // 2. Send to Gemini
      const result = await this.chatSession.sendMessage({ message: userMessage });
      const responseText = result.text;

      // 3. Add AI response to UI
      this.chatMessages.update(msgs => [...msgs, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat Error", error);
      this.chatMessages.update(msgs => [...msgs, { role: 'model', text: "Xin lỗi, tớ đang bị mất kết nối một chút. Thử lại sau nhé!" }]);
    } finally {
      this.isChatLoading.set(false);
    }
  }

  private getFallbackData(): AIAnalysis {
    return {
      title: "Người Đa Chiều (Offline)",
      summary: "Hệ thống **mất kết nối** với AI. Vui lòng kiểm tra internet.",
      work_style: "Chưa có dữ liệu.",
      relationship_style: "Chưa có dữ liệu.",
      life_analysis: { finance: "", health: "", stress: "", learning: "" },
      strengths: ["Tự chủ", "Độc lập"],
      weaknesses: ["Chưa có dữ liệu"],
      advice: ["Thử lại sau"]
    };
  }

  private getQuestions(): Question[] {
    const raw = [
      // OPENNESS (1-12)
      "Khi bạn phát hiện một lĩnh vực hoàn toàn mới (AI, triết học...), bạn thường dành thời gian nghiên cứu sâu.",
      "Trong cuộc họp, nếu ai đó đề xuất cách tiếp cận khác lạ, bạn muốn nghe chi tiết thay vì bác bỏ.",
      "Khi du lịch, bạn thích khám phá khu vực lạc đường và thử ẩm thực lạ.",
      "Khi gặp vấn đề, bạn thường nghĩ ra giải pháp không theo lối mòn.",
      "Bạn thích phim/sách có nội dung lạ lùng, cốt truyện khó đoán.",
      "Rảnh rỗi, bạn thường thử học kỹ năng sáng tạo mới (vẽ, viết, code art).",
      "Khi quy trình làm việc thay đổi, bạn xem đó là cơ hội học hỏi thay vì khó chịu.",
      "Thất bại là bài học để bạn cải tiến hoàn toàn khác lần tới.",
      "Bạn thích thay đổi lối sống và cách làm việc hàng ngày để tránh nhàm chán.",
      "Bạn hay tưởng tượng các kịch bản 'nếu như' và tư duy về tương lai.",
      "Nghệ thuật và âm nhạc thường gợi cho bạn những cảm xúc sâu sắc.",
      "Bạn sẵn sàng khám phá các quan điểm tôn giáo/chính trị đối lập với mình.",

      // CONSCIENTIOUSNESS (13-24)
      "Trước dự án lớn, bạn luôn lập danh sách chi tiết và deadline cụ thể.",
      "Không gian làm việc của bạn luôn gọn gàng, mọi thứ có vị trí cố định.",
      "Bạn sử dụng lịch hoặc to-do list để quản lý thời gian mỗi ngày.",
      "Khi làm báo cáo, bạn kiểm tra từng lỗi chính tả và định dạng nhỏ nhất.",
      "Bạn luôn đọc kỹ hướng dẫn sử dụng hoặc quy tắc trước khi bắt đầu.",
      "Bạn thường xuyên rà soát tài chính cá nhân để tìm sai lệch.",
      "Bạn hầu như luôn giữ lời hứa, kể cả phải làm ngoài giờ.",
      "Khi đặt mục tiêu (tập gym, học tập), bạn duy trì đều đặn dù gặp khó khăn.",
      "Bạn là người rất trung thành và đáng tin cậy trong các mối quan hệ.",
      "Trước khi mua sắm lớn, bạn so sánh giá và đọc review rất kỹ.",
      "Các quyết định quan trọng luôn được bạn cân nhắc lợi hại nhiều chiều.",
      "Bạn luôn tuân thủ an toàn và hướng dẫn khi tham gia hoạt động rủi ro.",

      // EXTRAVERSION (25-36)
      "Tại tiệc tùng, bạn chủ động bắt chuyện với người lạ.",
      "Ngày nghỉ, bạn thích tụ tập bạn bè hơn là ở nhà một mình.",
      "Bạn thường xung phong tổ chức các sự kiện cho nhóm.",
      "Bạn thích công việc phải giao tiếp nhiều (sales, quản lý, đối ngoại).",
      "Bạn cảm thấy hứng thú khi được phát biểu trước đám đông.",
      "Bạn sẵn sàng chi tiền cho các trải nghiệm xã hội và vui chơi cùng bạn.",
      "Khi stress, bạn tìm đến bạn bè để giải tỏa thay vì chịu đựng một mình.",
      "Trong nhóm, bạn thường tự nhiên trở thành người điều phối/lãnh đạo.",
      "Bạn thích chia sẻ cuộc sống và tương tác nhiều trên mạng xã hội.",
      "Bạn cảm thấy được nạp năng lượng khi ở nơi đông người náo nhiệt.",
      "Bạn có xu hướng hành động nhanh và quyết đoán.",
      "Bạn thường bộc lộ cảm xúc vui vẻ một cách rõ ràng ra bên ngoài.",

      // AGREEABLENESS (37-48)
      "Bạn luôn lắng nghe và thấu hiểu cảm xúc khi bạn bè tâm sự.",
      "Bạn chủ động hỏi thăm khi thấy ai đó trông có vẻ buồn.",
      "Bạn cảm thấy rất bất bình trước những bất công xã hội.",
      "Bạn sẵn sàng gác lại việc riêng để giúp đỡ người khác khi cần.",
      "Trong xung đột, bạn đóng vai trò hòa giải để cả hai bên vui vẻ.",
      "Bạn hào phóng chia sẻ đồ dùng hoặc tài chính với người khó khăn.",
      "Bạn thường tin tưởng người mới gặp cho đến khi có lý do để nghi ngờ.",
      "Khi có hiểu lầm, bạn sẵn sàng nhận lỗi và lắng nghe đối phương.",
      "Bạn dễ dàng tha thứ nếu người khác xin lỗi chân thành.",
      "Bạn ít khi to tiếng hay gây gổ với người khác.",
      "Bạn thích hợp tác hơn là cạnh tranh gay gắt.",
      "Bạn quan tâm đến việc người khác nghĩ gì và muốn làm hài lòng họ.",

      // NEUROTICISM (49-60)
      "Trước sự kiện quan trọng, bạn thường mất ngủ vì lo lắng.",
      "Sự cố nhỏ cũng làm bạn suy nghĩ và lo âu quá mức.",
      "Bạn hay tự chẩn đoán bệnh nghiêm trọng khi cơ thể có triệu chứng lạ.",
      "Bạn thường cảm thấy chán nản hoặc thiếu năng lượng không rõ lý do.",
      "Khi thất bại, bạn dễ tuyệt vọng và tự trách bản thân.",
      "Những suy nghĩ lo âu thường quấy rầy giấc ngủ của bạn.",
      "Một lời chỉ trích nhỏ cũng làm bạn tổn thương và suy nghĩ rất lâu.",
      "Bạn cảm thấy tội lỗi sâu sắc khi biết mình làm sai điều gì đó.",
      "Bạn rất hay lo lắng về cách người khác đánh giá mình.",
      "Khi tức giận, bạn dễ mất kiểm soát lời nói.",
      "Khi buồn, bạn thường suy sụp và khó tập trung làm việc.",
      "Những thay đổi bất ngờ làm bạn hoảng loạn và khó thích nghi."
    ];

    return raw.map((text, index) => {
      let category: 'O' | 'C' | 'E' | 'A' | 'N' = 'O';
      if (index >= 12 && index < 24) category = 'C';
      else if (index >= 24 && index < 36) category = 'E';
      else if (index >= 36 && index < 48) category = 'A';
      else if (index >= 48) category = 'N';

      return {
        id: index + 1,
        text,
        category
      };
    });
  }
}