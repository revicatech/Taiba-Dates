"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { orderLine, waLink } from "@/lib/whatsapp";

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, setQty, clear, count } = useCart();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function submitOrder() {
    if (items.length === 0) return;
    const lines = items.map((i, idx) =>
      `${idx + 1}) ${orderLine({ name: i.name, grade: i.grade, weight: i.weight, unitLabel: i.unitLabel, qty: i.qty })}`
    );
    const msg = `مرحباً، أريد طلب:\n${lines.join("\n")}`;
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <button
        type="button"
        className={`cart-backdrop${isOpen ? " open" : ""}`}
        aria-hidden={!isOpen}
        tabIndex={-1}
        onClick={close}
      />
      <aside className={`cart-drawer${isOpen ? " open" : ""}`} aria-hidden={!isOpen} aria-label="سلة الطلب">
        <header className="cart-header">
          <span className="cart-title">سلة الطلب {count > 0 && <span className="cart-count-pill">{count}</span>}</span>
          <button type="button" className="cart-close" aria-label="إغلاق" onClick={close}>✕</button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>سلتك فارغة.</p>
            <p className="cart-empty-sub">أضف منتجات لإرسال طلبك عبر واتساب.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((i) => (
                <div key={i.id} className="cart-item">
                  <div className="cart-item-thumb">
                    {i.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.imageUrl} alt={i.name} />
                    )}
                  </div>
                  <div className="cart-item-body">
                    <div className="cart-item-name">{i.name}</div>
                    <div className="cart-item-meta">
                      {[i.grade, i.weight, i.unitLabel].filter(Boolean).join(" · ")}
                    </div>
                    <div className="cart-qty">
                      <button type="button" aria-label="إنقاص" onClick={() => setQty(i.id, i.qty - 1)}>−</button>
                      <span>{i.qty}</span>
                      <button type="button" aria-label="زيادة" onClick={() => setQty(i.id, i.qty + 1)}>+</button>
                      <button type="button" className="cart-item-remove" onClick={() => removeItem(i.id)}>حذف</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="cart-footer">
              <button type="button" className="cart-submit" onClick={submitOrder}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                إرسال الطلب عبر واتساب
              </button>
              <button type="button" className="cart-clear" onClick={clear}>تفريغ السلة</button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
