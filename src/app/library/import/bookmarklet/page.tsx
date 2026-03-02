"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function buildBookmarkletCode(gamevaultUrl: string): string {
  // Inline the entire scraper into the javascript: URL so it runs as inline
  // script, bypassing CSP script-src restrictions on external scripts.
  const code = `(function(){
var G="${gamevaultUrl}";
var h=window.location.hostname;
var p=null,fn=null;
if(h.includes("epicgames.com")){p="PC";fn=epc;}
else if(h.includes("store.playstation.com")||h.includes("library.playstation.com")){p="PS";fn=psn;}
else{alert("GameVault: 이 사이트는 지원되지 않습니다.\\n지원: Epic Games Store, PlayStation Store\\n현재: "+h);return;}
function epc(){
var g=[],sl=['span.MuiTypography-ui-medium','[class*="am-hoct6b"]','[class*="TransactionItem_description"]','[data-testid="library-game-card"] span','[class*="GameListItem"] span','.css-rgqwpc','[data-component="OfferCardInfo"] h6','[data-component="Message"]'];
for(var i=0;i<sl.length;i++){var e=document.querySelectorAll(sl[i]);if(e.length>0){e.forEach(function(el){var n=el.textContent.trim();if(n&&n.length>1&&n.length<200)g.push(n);});break;}}
if(g.length===0){document.querySelectorAll('a[aria-label]').forEach(function(a){var l=a.getAttribute("aria-label");if(l&&l.length>1&&l.length<200)g.push(l);});}
return dd(g);}
function psn(){
var g=[],sl=['[data-qa="collection#702#item"] span','.ems-sdk-product-tile__title','[class*="GameTile"] span','[data-qa*="game-name"]','.psw-t-body'];
for(var i=0;i<sl.length;i++){var e=document.querySelectorAll(sl[i]);if(e.length>0){e.forEach(function(el){var n=el.textContent.trim();if(n&&n.length>1&&n.length<200)g.push(n);});break;}}
if(g.length===0){document.querySelectorAll('img[alt]').forEach(function(im){var a=im.getAttribute("alt");if(a&&a.length>2&&a.length<200)g.push(a);});}
return dd(g);}
function dd(a){var s={},r=[];for(var i=0;i<a.length;i++){var l=a[i].toLowerCase();if(!s[l]){s[l]=true;r.push(a[i]);}}return r;}
var gn=fn();
if(!gn||gn.length===0){alert("GameVault: 게임을 찾지 못했습니다.\\n\\n라이브러리 페이지에서 모든 게임이 보이도록 스크롤한 후 다시 시도해주세요.");return;}
var d={platform:p,games:gn,scrapedAt:new Date().toISOString(),sourceUrl:window.location.href};
var enc=btoa(encodeURIComponent(JSON.stringify(d)));
alert("GameVault: "+gn.length+"개의 게임을 찾았습니다!\\nGameVault 가져오기 페이지로 이동합니다.");
window.open(G+"/library/import#data="+enc,"_blank");
})()`;
  return "javascript:void " + encodeURIComponent(code);
}

export default function BookmarkletPage() {
  const [origin, setOrigin] = useState("");
  const bookmarkletRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const bookmarkletCode = buildBookmarkletCode(origin);

  useEffect(() => {
    if (bookmarkletRef.current && origin) {
      bookmarkletRef.current.setAttribute("href", bookmarkletCode);
    }
  }, [bookmarkletCode, origin]);

  return (
    <div className="min-h-screen bg-[#1a1c23] text-gray-200 pb-20">
      {/* Header */}
      <div className="w-full bg-[#111217]/80 backdrop-blur-md sticky top-16 z-40 py-8 px-6 border-b border-white/5 shadow-2xl mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/library/import"
              className="text-gray-500 hover:text-white transition-colors"
            >
              &larr; 가져오기
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight">
              북마클릿 설정
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            북마클릿을 이용하면 Epic Games Store, PlayStation 라이브러리에서 게임
            목록을 자동으로 스크랩할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-10">
        {/* Step 1: Install Bookmarklet */}
        <section className="bg-[#252833] rounded-2xl border border-gray-700 p-8 space-y-4">
          <h2 className="text-xl font-bold text-white">
            1단계: 북마클릿 설치
          </h2>
          <p className="text-gray-400 text-sm">
            아래 버튼을 브라우저 북마크바로 드래그하세요. (클릭하면 안 됩니다!)
          </p>

          <div className="flex justify-center py-6">
            <a
              ref={bookmarkletRef}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all cursor-grab active:cursor-grabbing shadow-lg shadow-blue-500/20"
              title="이 버튼을 북마크바로 드래그하세요"
            >
              라이브러리 가져오기
            </a>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-xl text-sm">
            북마크바가 보이지 않으면 Ctrl+Shift+B (Windows) 또는
            Cmd+Shift+B (Mac)로 표시할 수 있습니다.
          </div>
        </section>

        {/* Step 2: Usage per platform */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white">
            2단계: 사용 방법
          </h2>

          {/* Epic Games */}
          <div className="bg-[#252833] rounded-2xl border border-gray-700 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <h3 className="text-lg font-bold text-white">
                Epic Games Store
              </h3>
            </div>
            <ol className="list-decimal list-inside text-gray-400 text-sm space-y-2 ml-4">
              <li>
                <a
                  href="https://www.epicgames.com/account/transactions/purchases?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Epic Games Store
                </a>
                에 로그인하고 Transaction 페이지에 접속합니다
              </li>
              <li>
                북마크바에서{" "}
                <span className="text-blue-400 font-medium">
                  &quot;라이브러리 가져오기&quot;
                </span>
                를 클릭합니다.
              </li>
              <li>라이브러리 가져오기 페이지가 자동으로 열립니다.</li>
            </ol>
          </div>

          {/* PlayStation */}
          <div className="bg-[#252833] rounded-2xl border border-gray-700 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-bold text-white">
                PlayStation Store
              </h3>
            </div>
            <ol className="list-decimal list-inside text-gray-400 text-sm space-y-2 ml-4">
              <li>
                <a
                  href="https://library.playstation.com/recently-purchased"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  PlayStation 게임 라이브러리
                </a>
                에 로그인합니다.
              </li>
              <li>모든 게임이 보이도록 아래로 스크롤합니다.</li>
              <li>
                북마크바에서{" "}
                <span className="text-blue-400 font-medium">
                  &quot;라이브러리 가져오기&quot;
                </span>
                를 클릭합니다.
              </li>
              <li>라이브러리 가져오기 페이지가 자동으로 열립니다.</li>
            </ol>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="bg-[#252833] rounded-2xl border border-gray-700 p-8 space-y-4">
          <h2 className="text-xl font-bold text-white">
            문제 해결
          </h2>
          <div className="space-y-3 text-sm text-gray-400">
            <div>
              <p className="text-gray-300 font-medium">
                게임을 찾지 못했다고 나옵니다.
              </p>
              <p>
                페이지를 끝까지 스크롤한 후 다시 시도하세요. 라이브러리
                페이지에서 게임이 모두 로드되어야 합니다.
              </p>
            </div>
            <div>
              <p className="text-gray-300 font-medium">
                북마클릿이 작동하지 않습니다 (보안 정책).
              </p>
              <div className="space-y-2 mt-1">
                <p>
                  Epic Games는 보안 정책(CSP)으로 인해 북마클릿 실행을 차단할 수 있습니다. 이 경우 아래 방법을 시도하세요:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>북마크바의 <span className="text-blue-400">&quot;라이브러리 가져오기&quot;</span>를 <strong>우클릭</strong>하여 <span className="font-medium text-gray-200">링크 주소 복사</span>를 클릭합니다.</li>
                  <li>Epic Games 페이지에서 <strong>F12</strong>를 눌러 개발자 도구를 엽니다.</li>
                  <li><strong>Console</strong> 탭을 클릭합니다.</li>
                  <li>복사한 주소를 붙여넣고 <strong>Enter</strong>를 누릅니다.</li>
                </ol>
                <p className="text-xs text-gray-500 mt-2 italic">
                  * `javascript:` 부분이 자동으로 생략될 수 있으니, 붙여넣기 후 맨 앞에 `javascript:`가 있는지 확인해주세요.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Platforms */}
        <section className="text-center text-gray-500 text-sm">
          <p>지원 플랫폼: Epic Games Store, PlayStation Store</p>
          <p className="mt-1">
            Steam은{" "}
            <Link
              href="/library/import/steam"
              className="text-blue-400 hover:underline"
            >
              API 연동 방식
            </Link>
            을 이용해주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
