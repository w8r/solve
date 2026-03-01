function g(o, i, r, t) {
  const d = u(o, i), e = /* @__PURE__ */ new Set();
  function n(s) {
    if (e.has(s)) return;
    e.add(s);
    const f = o.find((c) => c._id === s);
    f && t(f);
    const a = d.get(s) ?? [];
    for (const c of a)
      n(c);
  }
  n(r);
}
function h(o, i, r, t) {
  const d = u(o, i), e = /* @__PURE__ */ new Set(), n = [r];
  for (; n.length > 0; ) {
    const s = n.shift();
    if (e.has(s)) continue;
    e.add(s);
    const f = o.find((c) => c._id === s);
    f && t(f);
    const a = d.get(s) ?? [];
    for (const c of a)
      e.has(c) || n.push(c);
  }
}
function u(o, i) {
  const r = /* @__PURE__ */ new Map();
  for (const t of o)
    r.set(t._id, []);
  for (const t of i) {
    const d = r.get(t.sourceId);
    d && d.push(t.targetId);
  }
  return r;
}
function p(o, i, r) {
  const t = [], d = new Set(i.map((e) => e._id));
  for (const e of r)
    d.has(e.sourceId) || t.push(`Edge ${e._id} references non-existent source node ${e.sourceId}`), d.has(e.targetId) || t.push(`Edge ${e._id} references non-existent target node ${e.targetId}`), e.graphId !== o._id && t.push(`Edge ${e._id} has graphId ${e.graphId} but expected ${o._id}`);
  for (const e of i)
    e.graphId !== o._id && t.push(`Node ${e._id} has graphId ${e.graphId} but expected ${o._id}`);
  return {
    valid: t.length === 0,
    errors: t
  };
}
function I(o, i, r) {
  const t = [], d = /* @__PURE__ */ new Set();
  function e(n) {
    for (const s of r)
      s.sourceId === n && !d.has(s.targetId) && (d.add(s.targetId), t.push(s.targetId), e(s.targetId));
  }
  return e(o), t;
}
function _(o, i, r) {
  const t = [], d = /* @__PURE__ */ new Set();
  function e(n) {
    for (const s of r)
      s.targetId === n && !d.has(s.sourceId) && (d.add(s.sourceId), t.push(s.sourceId), e(s.sourceId));
  }
  return e(o), t;
}
function l(o, i) {
  const r = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Map();
  for (const n of o)
    d.set(n._id, []);
  for (const n of i)
    d.get(n.sourceId)?.push(n.targetId);
  function e(n) {
    if (r.has(n)) return !0;
    if (t.has(n)) return !1;
    r.add(n);
    for (const s of d.get(n) ?? [])
      if (e(s)) return !0;
    return r.delete(n), t.add(n), !1;
  }
  for (const n of o)
    if (e(n._id)) return !0;
  return !1;
}
export {
  h as bfs,
  g as dfs,
  _ as findDependencies,
  I as findDependents,
  l as hasCycle,
  p as validateGraph
};
//# sourceMappingURL=index.js.map
