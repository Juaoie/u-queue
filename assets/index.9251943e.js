import{c as p,a as l,r as f,o as d,d as i,b as m,e as _,f as $}from"./vendor.0b741148.js";const h=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const a of t.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&c(a)}).observe(document,{childList:!0,subtree:!0});function r(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function c(e){if(e.ep)return;e.ep=!0;const t=r(e);fetch(e.href,t)}};h();var s=(n,o)=>{const r=n.__vccOpts||n;for(const[c,e]of o)r[c]=e;return r};const v={};function y(n,o){const r=f("router-view");return d(),p("main",null,[l(r)])}var g=s(v,[["render",y]]);const b=i({setup(){}});function x(n,o,r,c,e,t){return null}var A=s(b,[["render",x]]);const L=i({setup(){}});function N(n,o,r,c,e,t){return null}var O=s(L,[["render",N]]);const k=i({setup(){}});function w(n,o,r,c,e,t){return null}var B=s(k,[["render",w]]);const H=[{path:"/",meta:{title:"Home"},component:A},{path:"/about",meta:{title:"About"},component:O},{path:"/:page",component:B}],C=m({scrollBehavior:()=>({left:0,top:0}),history:_(),routes:H}),u=$(g);u.use(C);u.mount("#app");