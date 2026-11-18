// Local review only. No existing intake form may transmit a preview submission.
document.addEventListener('submit', (event) => {
  if (event.target.id === 'readinessForm') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const status = event.target.querySelector('[role="status"]');
  if (status) status.textContent = '검토용 화면입니다. 실제 접수와 이메일 발송은 연결하지 않았습니다.';
}, true);
