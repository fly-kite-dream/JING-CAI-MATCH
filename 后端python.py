from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

# 初始化 OpenAI 客户端，注意替换为你自己的 API Key 和 base_url
client = OpenAI(
    api_key=""//更改自己的api密钥
    base_url="https://api.deepseek.com"
)

app = Flask(__name__)
CORS(app)  # 允许跨域请求，自动处理 OPTIONS 预检

def generate_questions(position):
    system = "你是一位专业的面试官，请针对输入的岗位，生成5~10个常见面试问题（包括基础题和开放题）"
    user = f"岗位名称：{position}"
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    questions = response.choices[0].message.content.split('\n')
    return [q.strip() for q in questions if q.strip()]

def review_answer(question, answer):
    system = "请评估下面的面试问题与答案，给出详细点评和改进建议，不需要重复问题内容。"
    user = f"问题：{question}\n回答：{answer}"
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return response.choices[0].message.content

@app.route('/api/generate_questions', methods=['POST'])
def gen_ques():
    data = request.json
    position = data.get('position', '')
    if not position:
        return jsonify({'error': '岗位名称不能为空'}), 400
    questions = generate_questions(position)
    return jsonify({'questions': questions})

@app.route('/api/review_answer', methods=['POST'])
def rev_ans():
    data = request.json
    question = data.get('question', '')
    answer = data.get('answer', '')
    if not question or not answer:
        return jsonify({'error': '问题和答案不能为空'}), 400
    feedback = review_answer(question, answer)
    return jsonify({'feedback': feedback})

@app.route('/api/get_ai_comment', methods=['POST'])
def get_ai_comment():
    # 这里返回字段名用comment与前端匹配，不要重复定义
    data = request.json
    question = data.get('question', '')
    answer = data.get('answer', '')
    if not question or not answer:
        return jsonify({'error': '问题和答案不能为空'}), 400
    feedback = review_answer(question, answer)
    return jsonify({'comment': feedback})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 
