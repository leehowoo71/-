/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

// BAC calculation constants
const ALCOHOL_DENSITY = 0.789; // g/mL
const GENDER_CONSTANT_MALE = 0.68;
const GENDER_CONSTANT_FEMALE = 0.55;
const ELIMINATION_RATE = 0.015; // % per hour

// Drink definitions (name, typical volume in ml, alcohol by volume in %)
const drinkTypes = [
  { name: '소주 (Soju)', volume: 50, abv: 16.9 },
  { name: '맥주 (Beer)', volume: 200, abv: 5.0 },
  { name: '막걸리 (Makgeolli)', volume: 150, abv: 6.0 },
  { name: '와인 (Wine)', volume: 120, abv: 13.0 },
  { name: '위스키 (Whiskey)', volume: 30, abv: 40.0 },
];


const App: React.FC = () => {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<number>(70);
  const [drinks, setDrinks] = useState<{ type: string; quantity: number }[]>([]);
  const [hours, setHours] = useState<number>(1);
  
  const [bac, setBac] = useState<number | null>(null);
  const [status, setStatus] = useState<'safe' | 'caution' | 'danger' | null>(null);

  const [policyVisible, setPolicyVisible] = useState(false);

  const handleAddDrink = () => {
    setDrinks([...drinks, { type: drinkTypes[0].name, quantity: 1 }]);
  };

  const handleDrinkChange = (index: number, field: 'type' | 'quantity', value: string | number) => {
    const newDrinks = [...drinks];
    if (field === 'type' && typeof value === 'string') {
      newDrinks[index].type = value;
    } else if (field === 'quantity' && typeof value === 'number') {
      newDrinks[index].quantity = value > 0 ? value : 0;
    }
    setDrinks(newDrinks);
  };
  
  const handleRemoveDrink = (index: number) => {
    const newDrinks = drinks.filter((_, i) => i !== index);
    setDrinks(newDrinks);
  }

  const calculateBAC = () => {
    if (weight <= 0) {
      alert('체중을 정확히 입력해주세요.');
      return;
    }
    
    if (drinks.length === 0) {
        alert('마신 술을 하나 이상 추가해주세요.');
        return;
    }

    const totalAlcoholGrams = drinks.reduce((acc, drink) => {
      const drinkInfo = drinkTypes.find(d => d.name === drink.type);
      if (!drinkInfo) return acc;
      // total alcohol (g) = volume (ml) * quantity * (ABV / 100) * alcohol density
      return acc + (drinkInfo.volume * drink.quantity) * (drinkInfo.abv / 100) * ALCOHOL_DENSITY;
    }, 0);
    
    const genderConstant = gender === 'male' ? GENDER_CONSTANT_MALE : GENDER_CONSTANT_FEMALE;
    const bodyWeightGrams = weight * 1000;

    const estimatedBac = ((totalAlcoholGrams / (bodyWeightGrams * genderConstant)) * 100) - (hours * ELIMINATION_RATE);

    const finalBac = Math.max(0, estimatedBac); // BAC cannot be negative
    setBac(finalBac);

    if (finalBac < 0.03) {
      setStatus('safe');
    } else if (finalBac < 0.08) {
      setStatus('caution');
    } else {
      setStatus('danger');
    }
  };

  const getStatusInfo = () => {
    if (bac === null) return null;
    
    const bacPercent = bac.toFixed(3);
    
    switch (status) {
      case 'safe':
        return {
          bgColor: 'bg-green-500/10 border-green-500/20',
          textColor: 'text-green-300',
          title: '안전 (Safe)',
          message: `예상 혈중 알코올 농도는 ${bacPercent}% 입니다. 법적 처벌 기준(0.03%) 미만이지만, 운전은 삼가는 것이 좋습니다.`,
        };
      case 'caution':
        return {
          bgColor: 'bg-yellow-500/10 border-yellow-500/20',
          textColor: 'text-yellow-300',
          title: '주의 (Caution)',
          message: `예상 혈중 알코올 농도는 ${bacPercent}% 입니다. 면허 정지(0.03% 이상)에 해당합니다. 절대 운전하지 마세요.`,
        };
      case 'danger':
        return {
          bgColor: 'bg-red-500/10 border-red-500/20',
          textColor: 'text-red-300',
          title: '위험 (Danger)',
          message: `예상 혈중 알코올 농도는 ${bacPercent}% 입니다. 면허 취소(0.08% 이상)에 해당하며, 매우 위험한 상태입니다. 절대 운전하지 마세요.`,
        };
      default:
        return null;
    }
  };
  
  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen text-gray-100 flex flex-col items-center bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            음주운전 예방 프로그램
          </h1>
          <p className="mt-2 text-lg text-gray-400">혈중 알코올 농도(BAC)를 예상하고 안전한 귀가를 계획하세요.</p>
        </header>

        <main className="space-y-8">
          {/* BAC Calculator Section */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-center mb-6">혈중 알코올 농도(BAC) 계산기</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">성별</label>
                <select id="gender" value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">체중 (kg)</label>
                <input type="number" id="weight" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 70" />
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-300 mb-2">마신 술 (종류와 잔/병 수)</h3>
              <div className="space-y-3">
                {drinks.map((drink, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-md">
                    <select value={drink.type} onChange={e => handleDrinkChange(index, 'type', e.target.value)} className="flex-grow bg-gray-700 border-gray-600 rounded-md p-2">
                      {drinkTypes.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                    <input type="number" min="1" value={drink.quantity} onChange={e => handleDrinkChange(index, 'quantity', Number(e.target.value))} className="w-24 bg-gray-700 border-gray-600 rounded-md p-2" placeholder="잔/병"/>
                    <button onClick={() => handleRemoveDrink(index)} className="bg-red-600 hover:bg-red-500 text-white font-bold p-2 rounded-md transition-colors flex-shrink-0">
                      삭제
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleAddDrink} className="mt-3 w-full text-blue-300 hover:text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 rounded-md p-2 transition-colors">
                + 마신 술 추가하기
              </button>
            </div>
            
            <div className="mt-6">
              <label htmlFor="hours" className="block text-sm font-medium text-gray-300 mb-1">마지막 음주 후 경과 시간 (시간)</label>
              <input type="number" min="0" id="hours" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 1" />
            </div>

            <button onClick={calculateBAC} className="mt-8 w-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 ease-in-out shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-px active:scale-95">
              계산하기
            </button>

            {statusInfo && (
              <div className={`mt-6 p-4 rounded-lg border animate-fade-in ${statusInfo.bgColor}`}>
                <h3 className={`text-xl font-bold ${statusInfo.textColor}`}>{statusInfo.title}</h3>
                <p className="mt-1 text-gray-300">{statusInfo.message}</p>
              </div>
            )}
             <p className="text-xs text-gray-500 mt-4 text-center">※ 이 계산은 일반적인 공식을 사용한 추정치이며, 개인의 건강 상태나 컨디션에 따라 실제 수치와 다를 수 있습니다. 법적 효력이 없으며 참고용으로만 사용하세요.</p>
          </section>

          {/* Company Policy Section */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
            <button onClick={() => setPolicyVisible(!policyVisible)} className="w-full flex justify-between items-center text-left text-2xl font-bold">
              <h2>송파구시설관리공단 음주운전 징계 기준</h2>
              <span className={`transform transition-transform duration-300 ${policyVisible ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {policyVisible && (
               <div className="mt-4 pt-4 border-t border-gray-700 text-gray-300 animate-fade-in">
                <div className="overflow-x-auto relative rounded-lg">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs uppercase bg-gray-700/80 text-gray-300">
                            <tr>
                                <th scope="col" className="py-3 px-4">유형별</th>
                                <th scope="col" className="py-3 px-4">징계요구</th>
                                <th scope="col" className="py-3 px-4">징계기준</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td colSpan={3} className="py-2 px-4 font-semibold text-white">1. 최초 음주운전을 한 경우</td>
                            </tr>
                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">가. 혈중알코올농도가 0.08퍼센트 미만인 경우</td>
                                <td className="py-2 px-4">경징계 또는 중징계</td>
                                <td className="py-2 px-4">정직 ~ 감봉</td>
                            </tr>
                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">나. 혈중알코올농도가 0.08퍼센트 이상 0.2퍼센트 미만인 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">강등 ~ 정직</td>
                            </tr>
                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">다. 혈중알코올농도가 0.2퍼센트 이상인 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">해임 ~ 정직</td>
                            </tr>
                             <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">라. 음주측정 불응의 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">해임 ~ 정직</td>
                            </tr>

                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 font-semibold text-white">2. 2회 음주운전을 한 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">파면 ~ 강등</td>
                            </tr>

                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 font-semibold text-white">3. 3회 이상 음주운전을 한 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">파면 ~ 해임</td>
                            </tr>

                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 font-semibold text-white">4. 음주운전으로 운전면허가 정지되거나 취소된 상태에서 운전을 한 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">강등 ~ 정직</td>
                            </tr>

                             <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 font-semibold text-white">5. 음주운전으로 운전면허가 정지되거나 취소된 상태에서 음주운전을 한 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">파면 ~ 강등</td>
                            </tr>

                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td colSpan={3} className="py-2 px-4 font-semibold text-white">6. 음주운전으로 인적 또는 물적 피해가 있는 교통사고를 일으킨 경우</td>
                            </tr>
                             <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">가. 상해 또는 물적 피해의 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">해임 ~ 정직</td>
                            </tr>
                             <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">나. 사망사고의 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">파면 ~ 해임</td>
                            </tr>
                             <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">다. 사고 후 「도로교통법」 제54조제1항에 따른 조치를 하지 않은 경우</td>
                                <td className="py-2 px-4"></td>
                                <td className="py-2 px-4"></td>
                            </tr>
                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-12">1) 물적 피해 후 도주한 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">해임 ~ 정직</td>
                            </tr>
                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-12">2) 인적 피해 후 도주한 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">파면 ~ 해임</td>
                            </tr>

                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td colSpan={3} className="py-2 px-4 font-semibold text-white">7. 운전업무 관련 직원이 음주운전을 한 경우</td>
                            </tr>
                             <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">가. 운전면허 취소처분을 받은 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">파면 ~ 해임</td>
                            </tr>
                            <tr className="bg-gray-800/50 hover:bg-gray-700/50">
                                <td className="py-2 px-4 pl-8">나. 운전면허 정지처분을 받은 경우</td>
                                <td className="py-2 px-4">중징계</td>
                                <td className="py-2 px-4">해임 ~ 정직</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-sm text-yellow-400">※ 위 기준은 최소한의 징계 기준이며, 사안의 중대성에 따라 가중 처벌될 수 있습니다.</p>
              </div>
            )}
          </section>
          
          {/* Call for Help Section */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm text-center">
            <h2 className="text-2xl font-bold mb-4">안전한 귀가를 위한 선택</h2>
            <p className="text-gray-400 mb-6">음주 후에는 대중교통, 택시, 대리운전을 이용하세요.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="tel:02-1577-1577" className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg">
                대리운전 호출
              </a>
               <a href="tel:1588-4455" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition-colors text-lg">
                카카오택시 호출
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;