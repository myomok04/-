import React from "react"

// 간단하게 알림창이 뜰 수 있는 틀만 만들어 둡니다.
export function Toaster() {
  return (
    <div id="toaster-container" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {/* 나중에 실제 알림 메시지들이 여기에 나타나게 됩니다. */}
    </div>
  )
}