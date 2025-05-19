import React, { useState } from 'react';  
import { Button, Input, Card, Typography, Space, Spin, message } from 'antd';  
import { AudioOutlined } from '@ant-design/icons';  

const { Title, Text } = Typography;  
const { TextArea } = Input;  

function App() {  
  const [position, setPosition] = useState('');  
  const [questions, setQuestions] = useState([]);  
  const [loading, setLoading] = useState(false);  
  const [answers, setAnswers] = useState({});  
  const [aiComments, setAiComments] = useState({});  
  const [submitLoading, setSubmitLoading] = useState(false);  

  // 生成面试题  
  const handleGenerate = async () => {  
    if (!position.trim()) {  
      message.warning('请输入岗位名称');  
      return;  
    }  
    setLoading(true);  
    try {  
      const res = await fetch('http://localhost:5000/api/generate_questions', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ position })  
      });  
      if (!res.ok) throw new Error('生成失败');  
      const data = await res.json();  
      setQuestions(data.questions || []);  
      setAnswers({});  
      setAiComments({});  
    } catch (error) {  
      message.error('生成面试题出错，请稍后重试');  
    }  
    setLoading(false);  
  };  

  // 提交答案并获取AI点评  
  const handleSubmitAnswer = async (index) => {  
    const answer = answers[index] || '';  
    if (!answer.trim()) {  
      message.warning('请填写答案');  
      return;  
    }  

    setSubmitLoading(true);  
    try {  
      const res = await fetch('http://localhost:5000/api/get_ai_comment', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ question: questions[index], answer })  
      });  
      if (!res.ok) throw new Error('点评失败');  
      const data = await res.json();  
      setAiComments(prev => ({ ...prev, [index]: data.comment || '无点评' }));  
    } catch (error) {  
      message.error('获取AI点评失败');  
    }  
    setSubmitLoading(false);  
  };  

  // 简单语音输入示例（浏览器支持SpeechRecognition）  
  const handleVoiceInput = (index) => {  
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {  
      message.error('浏览器不支持语音识别');  
      return;  
    }  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;  
    const recognition = new SpeechRecognition();  
    recognition.lang = 'zh-CN';  
    recognition.interimResults = false;  
    recognition.maxAlternatives = 1;  

    recognition.onresult = (event) => {  
      const transcript = event.results[0][0].transcript;  
      setAnswers(prev => ({ ...prev, [index]: (prev[index] || '') + transcript }));  
    };  
    recognition.onerror = () => {  
      message.error('语音识别错误');  
    };  
    recognition.start();  
  };  

  return (  
    <div style={{ maxWidth: 800, margin: '40px auto' }}>  
      <Card bordered={false} style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>  
        <Title level={3}>AI模拟HR</Title>  
        <Space direction="vertical" style={{ width: '100%' }}>  
          <Input  
            placeholder="请输入岗位名称（例如：老师）"  
            value={position}  
            onChange={e => setPosition(e.target.value)}  
            allowClear  
            style={{ maxWidth: 300 }}  
          />  
          <Button type="primary" onClick={handleGenerate} loading={loading}>生成面试题</Button>  
        </Space>  
      </Card>  

      {questions.length > 0 && questions.map((q, idx) => (  
        <Card  
          key={idx}  
          title={<Text strong>第 {idx + 1} 题 / {questions.length}</Text>}  
          bordered  
          style={{ marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}  
        >  
          <Text>题目：</Text>  
          <Text style={{ display: 'block', marginBottom: 12, whiteSpace: 'pre-wrap' }}>{q}</Text>  

          <Text strong>你的答案：</Text>  
          <TextArea  
            rows={4}  
            value={answers[idx] || ''}  
            onChange={e => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))}  
            placeholder="请输入你的答案"  
          />  
          <Space style={{ marginTop: 8 }}>  
            <Button icon={<AudioOutlined />} onClick={() => handleVoiceInput(idx)}>  
              语音输入  
            </Button>  
            <Button  
              type="primary"  
              onClick={() => handleSubmitAnswer(idx)}  
              loading={submitLoading}  
              disabled={submitLoading}  
            >  
              提交并获取AI点评  
            </Button>  
          </Space>  

          <div style={{ marginTop: 16 }}>  
            {aiComments[idx] && (  
              <Card type="inner" style={{ backgroundColor: '#f9f9f9' }}>  
                <Text strong>AI点评：</Text>  
                <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{aiComments[idx]}</div>  
              </Card>  
            )}  
          </div>  
        </Card>  
      ))}  

      {(loading || submitLoading) && (  
        <div style={{ textAlign: 'center', marginTop: 20 }}>  
          <Spin tip="AI 正在思考中..." />  
        </div>  
      )}  
    </div>  
  );  
}  

export default App;  
