import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { base, ingredients, concept } = await req.json();

    if (!base) {
      return NextResponse.json({ error: 'Base is required' }, { status: 400 });
    }

    // Initialize the Gemini client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const ingredientsText = ingredients && ingredients.length > 0 ? ingredients.join(', ') : 'なし';

    const prompt = `
    ユーザーの入力（ベース料理、トッピング、コンセプト）に基づいて、カフェのメニューを1つ開発し、それをプロが撮影したようなリアルな写真として出力するためのデータを作成してください。

    【重要ルール：奇抜さの調整】
    - 入力されたトッピングやコンセプトが「ごく普通」で常識的な組み合わせ（例：パンケーキ＋イチゴ等）の場合は、絶対に奇をてらわず、「普通に美味しそうでお洒落な、正統派のカフェメニュー」を作成してください。勝手に爆発させたり、光らせたり、巨大化させたりしないでください。
    - 入力されたトッピングに「タバスコ」「ドライアイス」「金箔」「ネオンゼリー」などの特殊なものや、コンセプトに奇抜な指定がある場合のみ、それに全力で応えて「SNSでバズる（あるいは炎上する）奇抜でクレイジーなメニュー」を作成してください。

    必ず以下のJSON形式でのみ出力してください。他のテキストは不要です。

    {
      "menu_name": "メニュー名",
      "score_bae": 85,
      "score_risk": 15,
      "risk_reason": "炎上する理由の想定（安全なものは「特に問題なし」とし、食べ物を粗末にしている・不衛生などの明らかな問題がある場合のみ炎上リスクを高くしてください）",
      "score_taste": 30,
      "taste_review": "味についての短いコメント（見た目と味のギャップ等）",
      "image_prompt": "英語の画像生成プロンプト"
    }

    [各スコアの評価基準]:
    - score_bae (映え度): 見た目のインパクト、SNSでのバズりやすさ。以下の基準で厳密に採点してください。
      - 0〜40点: 「普通に美味しそう」なだけの一般的なメニュー（パンケーキ＋イチゴなど）。映え度は低くしてください。
      - 50〜70点: 少し変わっていてお洒落だが、まだ常識の範囲内のメニュー。
      - 80〜100点: 思わず二度見する「とんちきメニュー（燃えている、奇抜な色、巨大すぎる等）」や、SNSで確実にバズるインパクト絶大なメニュー。普通に美味しそうなだけのメニューを絶対に高得点にしないでください。
    - score_risk (炎上リスク): 以下の基準で厳密に採点してください。
      - 0〜20点: 常識的で安全。炎上の心配は全くない。
      - 30〜50点: やや奇抜すぎて「食べづらい」「値段と合わない」などのプチ不満が出るレベル。
      - 60〜80点: 「食べ物を粗末にしている」「健康被害が出そう」など、道徳的・衛生的な批判が集まるレベル。
      - 90〜100点: 営業停止レベルの明らかな危険物、または深刻なタブーに触れている。

    [image_promptの作成指示]:
    - スタイルは必ず「Ultra-realistic food photography（超リアルなフードフォト）」とすること。
    - 具材の質感（光沢、柔らかさ、煙）を強調する「Dramatic studio lighting」を指定。
    - 背景はモダンな高級レストランのテーブル（美しくボケている）に設定。

    Input:
    ベース料理: ${base}
    トッピング: ${ingredientsText}
    コンセプト: ${concept || 'なし'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No response text from Gemini');
    }

    const dishData = JSON.parse(resultText);

    // Calculate dynamic price based on scores
    // Base price + bae score bonus - flame risk penalty + taste bonus
    let basePrice = 500;
    if (base.includes('パフェ') || base.includes('パンケーキ')) basePrice = 800;
    
    let calculatedPrice = Math.max(100, Math.floor(basePrice + (dishData.score_bae * 10) - (dishData.score_risk * 5) + (dishData.score_taste * 5)));
    // Round to nearest 10
    calculatedPrice = Math.round(calculatedPrice / 10) * 10;

    return NextResponse.json({
      ...dishData,
      price: calculatedPrice
    });
  } catch (error: any) {
    console.error('Error in evaluate route, using mock fallback:', error);
    
    // API制限などでエラーになった場合は進行不能を防ぐためにモックデータを返す
    const mockData = {
      menu_name: `【AI限界】謎のヤバいアレンジ`,
      score_bae: Math.floor(Math.random() * 40) + 60,
      score_risk: Math.floor(Math.random() * 50) + 30,
      risk_reason: "AI制限中により自動生成されたリスクです",
      score_taste: Math.floor(Math.random() * 50) + 30,
      taste_review: "（通信制限中につき、AIシェフはお休みしています...）",
      image_prompt: "A crazy and weird cafe food item, high quality food photography",
      price: Math.floor(Math.random() * 1000) + 1000
    };

    return NextResponse.json(mockData);
  }
}
