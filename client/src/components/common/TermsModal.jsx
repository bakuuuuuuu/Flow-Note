import { useState } from 'react'

const TERMS = {
  service: {
    title: '이용약관',
    content: [
      {
        heading: '제1조 (목적)',
        text: `이 약관은 Flow-Note(이하 "회사")가 제공하는 칸반보드 기반 업무 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`
      },
      {
        heading: '제2조 (정의)',
        text: `① "서비스"란 회사가 제공하는 Flow-Note 칸반보드 업무 관리 플랫폼 및 관련 제반 서비스를 의미합니다.\n② "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.\n③ "회원"이란 회사에 개인정보를 제공하여 회원 등록을 한 자로서, 회사의 서비스를 지속적으로 이용할 수 있는 자를 말합니다.\n④ "보드"란 회원이 생성한 칸반 형태의 업무 관리 공간을 의미합니다.`
      },
      {
        heading: '제3조 (약관의 효력 및 변경)',
        text: `① 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.\n② 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 서비스 내 공지사항을 통해 사전 고지합니다.\n③ 회원은 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.`
      },
      {
        heading: '제4조 (서비스의 제공)',
        text: `① 회사는 다음과 같은 서비스를 제공합니다.\n  - 칸반 보드 생성 및 관리 서비스\n  - 캘린더 기반 일정 관리 서비스\n  - 마감 임박 알림 서비스\n  - 통합 검색 서비스\n  - 기타 회사가 추가 개발하거나 제휴를 통해 제공하는 일체의 서비스\n② 서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검 등 불가피한 경우 일시적으로 중단될 수 있습니다.`
      },
      {
        heading: '제5조 (회원가입)',
        text: `① 이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.\n② 회사는 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.\n  - 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우\n  - 등록 내용에 허위, 기재누락, 오기가 있는 경우\n  - 기타 회원으로 등록하는 것이 서비스 운영에 현저히 지장이 있다고 판단되는 경우`
      },
      {
        heading: '제6조 (회원의 의무)',
        text: `① 회원은 다음 행위를 하여서는 안 됩니다.\n  - 타인의 정보 도용\n  - 회사가 게시한 정보의 변경\n  - 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 송신 또는 게시\n  - 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해\n  - 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위\n  - 외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위`
      },
      {
        heading: '제7조 (서비스 이용 제한)',
        text: `회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 순으로 서비스 이용을 제한할 수 있습니다.`
      },
      {
        heading: '제8조 (책임의 한계)',
        text: `① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.\n② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.\n③ 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.`
      },
      {
        heading: '제9조 (분쟁 해결)',
        text: `① 회사와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법원에 제기합니다.\n② 이 약관과 관련된 분쟁에 대해서는 대한민국 법을 적용합니다.`
      },
      {
        heading: '부칙',
        text: `이 약관은 2026년 1월 1일부터 시행합니다.`
      }
    ]
  },
  privacy: {
    title: '개인정보처리방침',
    content: [
      {
        heading: '제1조 (개인정보의 처리 목적)',
        text: `Flow-Note(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.\n① 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량 회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 분쟁 조정을 위한 기록보존, 불만처리 등 민원처리, 고지사항 전달\n② 서비스 제공: 칸반 보드, 캘린더, 알림, 검색 등 서비스 제공`
      },
      {
        heading: '제2조 (처리하는 개인정보 항목)',
        text: `회사는 다음의 개인정보 항목을 처리하고 있습니다.\n① 필수항목: 이메일 주소, 비밀번호, 이름, 닉네임, 성별, 생년월일, 휴대전화번호\n② 선택항목: 프로필 이미지, 상태 메시지\n③ 서비스 이용 과정에서 자동 생성·수집되는 정보: 서비스 이용 기록, 접속 로그, 쿠키`
      },
      {
        heading: '제3조 (개인정보의 처리 및 보유 기간)',
        text: `① 회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.\n② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.\n  - 회원 가입 및 관리: 회원 탈퇴 시까지\n  - 단, 관련 법령에 의해 보존할 필요가 있는 경우 해당 기간까지 보존`
      },
      {
        heading: '제4조 (개인정보의 제3자 제공)',
        text: `회사는 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 현재 회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다.`
      },
      {
        heading: '제5조 (개인정보처리의 위탁)',
        text: `회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.\n  - 위탁받는 자: Amazon Web Services(AWS)\n  - 위탁하는 업무의 내용: 데이터 보관 및 인프라 운영\n회사는 위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고 있습니다.`
      },
      {
        heading: '제6조 (정보주체의 권리·의무)',
        text: `① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.\n  - 개인정보 열람 요구\n  - 오류 등이 있을 경우 정정 요구\n  - 삭제 요구\n  - 처리정지 요구\n② 위 권리 행사는 마이페이지 또는 이메일을 통해 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.`
      },
      {
        heading: '제7조 (개인정보의 파기)',
        text: `① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.\n② 전자적 파일 형태의 정보는 기술적 방법을 사용하여 복구 및 재생이 불가능하도록 안전하게 삭제합니다.`
      },
      {
        heading: '제8조 (개인정보의 안전성 확보 조치)',
        text: `회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.\n① 관리적 조치: 내부관리계획 수립·시행\n② 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 개인정보의 암호화, 보안프로그램 설치\n③ 물리적 조치: 전산실, 자료보관실 등의 접근통제`
      },
      {
        heading: '제9조 (개인정보 보호책임자)',
        text: `회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n▶ 개인정보 보호책임자\n  - 이메일: support@flownote.com`
      },
      {
        heading: '부칙',
        text: `이 개인정보처리방침은 2026년 1월 1일부터 적용됩니다.`
      }
    ]
  }
}

const TermsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('service')
  const current = TERMS[activeTab]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '90%', maxWidth: '600px', maxHeight: '80vh',
        background: '#1c1f26', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>

        {/* 헤더 */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8eaf0', margin: 0 }}>
            약관 및 정책
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(232,234,240,0.4)', padding: '4px', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e8eaf0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,234,240,0.4)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {[
            { key: 'service', label: '이용약관' },
            { key: 'privacy', label: '개인정보처리방침' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, height: '44px', background: 'none', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #4f70ff' : '2px solid transparent',
                color: activeTab === tab.key ? '#7b9cff' : 'rgba(232,234,240,0.4)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {current.content.map((section, i) => (
            <div key={i} style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#e8eaf0', marginBottom: '8px' }}>
                {section.heading}
              </h4>
              <p style={{ fontSize: '12px', color: 'rgba(232,234,240,0.5)', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>
                {section.text}
              </p>
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button
            type="button" onClick={onClose}
            style={{
              width: '100%', height: '42px', borderRadius: '10px',
              background: '#2d408e', border: '1px solid rgba(79,112,255,0.35)',
              color: 'white', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#243370'}
            onMouseLeave={e => e.currentTarget.style.background = '#2d408e'}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsModal