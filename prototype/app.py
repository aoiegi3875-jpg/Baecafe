# app.py
import streamlit as st
from google import genai
from google.genai import types
import json
from io import BytesIO
from PIL import Image

# 画面の基本設定
st.set_page_config(page_title="映え料理ジェネレーター", page_icon="🍳", layout="centered")

# 洗練されたUIにするための装飾（CSS）
st.markdown("""
    <style>
    .stApp { background-color: #F8F9FA; }
    .dish-card {
        background-color: white;
        padding: 24px;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        margin-top: 20px;
    }
    .menu-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
    .score-tag {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        margin-right: 8px;
    }
    </style>
""", unsafe_allow_html=True)

st.title("🍳 映え料理ジェネレーター (MVP)")
st.caption("『炎上ギリギリ！映えカフェ経営』開発プロトタイプ")

# 安全にAPIキーを読み込む
API_KEY = st.secrets["GEMINI_API_KEY"]
client = genai.Client(api_key=API_KEY)

# アイデアガチャの準備
import random

BASE_FOODS = ["パンケーキ", "ラーメン", "ハンバーガー", "かき氷", "パフェ", "オムライス", "カレーライス", "寿司", "ピザ", "タピオカミルクティー", "フライドポテト", "マカロン"]
TOPPINGS = [
    "青いシロップと光るドライアイス", "大量の金箔とキャビア", "燃え盛る青い炎", 
    "レインボーカラーの巨大綿あめ", "注射器に入った赤い液体ソース", "山盛りの激辛スパイス", 
    "真っ黒なイカ墨", "試験管に入ったネオンカラーのゼリー", "とろけるチーズの滝",
    "丸ごとのフライドチキン", "大量の目玉グミ", "バラの花びらと食用香水"
]
CONCEPTS = [
    "サイバーパンクな近未来ジャンク", "魔界のダークファンタジー", "ゆめかわいい魔法の国", 
    "地獄の業火デスソース", "深海のミステリー", "マッドサイエンティストの実験室", 
    "成金セレブの朝食", "廃墟カフェのディストピア飯", "宇宙人の隠し味"
]

if "input_base" not in st.session_state:
    st.session_state.input_base = "パンケーキ"
if "input_topping" not in st.session_state:
    st.session_state.input_topping = "青いシロップと、光るドライアイスの煙"
if "input_concept" not in st.session_state:
    st.session_state.input_concept = "サイバーパンクな近未来のジャンクスイーツ"

def generate_random_idea():
    st.session_state.input_base = random.choice(BASE_FOODS)
    st.session_state.input_topping = random.choice(TOPPINGS)
    st.session_state.input_concept = random.choice(CONCEPTS)

st.button("🎲 ランダムなアイデアを出す（ガチャ）", on_click=generate_random_idea)

# ユーザー入力フォーム
with st.form("menu_form"):
    col1, col2 = st.columns(2)
    with col1:
        base_food = st.text_input("ベース料理・飲料", key="input_base")
    with col2:
        topping = st.text_input("トッピング・調理法", key="input_topping")
        
    concept = st.text_input("メニューのコンセプト", key="input_concept")
    submitted = st.form_submit_button("新メニューを開発する！")

# 生成処理
if submitted:
    # 画面表示（ミニマルなカードUI風）の枠組み
    st.markdown('<div class="dish-card">', unsafe_allow_html=True)
    
    # プレースホルダー（後で中身を書き換えるための箱）を準備
    image_placeholder = st.empty()
    image_placeholder.info("🧠 AIシェフが奇抜なレシピと設定を考案中...")
    
    text_placeholder = st.empty()
    
    try:
        # 1. Geminiでデータとプロンプトの生成
        structure_prompt = f"""
        ユーザーの入力に基づいて、奇抜で『SNSでバズる（映える）』メニューを1つ開発し、それをプロが撮影したようなリアルな写真として出力するためのデータを作成してください。
        必ず以下のJSON形式でのみ出力してください。他のテキストは不要です。

        {{
          "menu_name": "メニュー名",
          "score_bae": 85,
          "score_risk": 15,
          "risk_reason": "炎上する理由の想定（安全なものは「特に問題なし」とし、食べ物を粗末にしている・不衛生などの明らかな問題がある場合のみ炎上リスクを高くしてください）",
          "score_taste": 30,
          "taste_review": "味についての短いコメント（見た目と味のギャップ等）",
          "image_prompt": "英語の画像生成プロンプト"
        }}

        [各スコアの評価基準]:
        - score_bae (映え度): 見た目のインパクト、色彩の美しさ、SNSでシェアしたくなる度合い。
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
        ベース料理: {base_food}
        トッピング: {topping}
        コンセプト: {concept}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=structure_prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        dish_data = json.loads(response.text)
        
        # 【UX改善】画像生成で待たせる前に、先に「テキストデータ（スコアやレビュー）」を表示して読ませる
        with text_placeholder.container():
            st.markdown(f'<div class="menu-title">{dish_data["menu_name"]}</div>', unsafe_allow_html=True)
            st.markdown(f"""
                <div style="margin-bottom: 10px;">
                    <span class="score-tag" style="background-color: #FFE3E3; color: #FF4B4B;">✨ 映え度: {dish_data['score_bae']}/100</span>
                    <span class="score-tag" style="background-color: #E3F2FD; color: #1E88E5;">🔥 炎上リスク: {dish_data['score_risk']}/100</span>
                    <span class="score-tag" style="background-color: #E8F5E9; color: #43A047;">🍴 美味しさ: {dish_data.get('score_taste', 0)}/100</span>
                </div>
                <p style="color: #666; font-size: 14px; background-color: #FFF3E0; padding: 10px; border-radius: 8px; margin-bottom: 5px;"><strong>🚨 炎上リスク分析:</strong> {dish_data.get('risk_reason', '特に炎上要素なし')}</p>
                <p style="color: #666; font-size: 14px; background-color: #f5f5f5; padding: 10px; border-radius: 8px;"><strong>🍽️ 試食レビュー:</strong> {dish_data.get('taste_review', '（レビューなし）')}</p>
            """, unsafe_allow_html=True)
            
            with st.expander("AI用画像生成プロンプト（裏側のデータ）"):
                st.caption(dish_data['image_prompt'])
                
        # 画像生成中のメッセージに切り替え
        image_placeholder.info("📸 メニュー完成！プロカメラマンが「映え写真」を撮影中...（数秒かかります）")
        
        # 2. 画像生成（無料枠回避のため、無料の画像生成APIを使用）
        import urllib.parse
        import requests
        encoded_prompt = urllib.parse.quote(dish_data['image_prompt'])
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&nologo=true"
        img_response = requests.get(image_url)
        
        # 3. 画像表示（プレースホルダーを画像で上書き）
        if img_response.status_code == 200:
            image_placeholder.image(img_response.content, use_container_width=True)
        else:
            image_placeholder.warning("画像の生成に失敗しました。時間をおいて再試行してください。")
            
    except Exception as e:
        error_msg = str(e).lower()
        if "429" in error_msg or "quota" in error_msg:
            st.error("⚠️ AIの無料リクエスト制限に達しました。約1分ほど待ってから再度お試しください。")
        else:
            st.error(f"エラーが発生しました: {e}")
            
    st.markdown('</div>', unsafe_allow_html=True)