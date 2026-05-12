# Πλάνο: Βελτίωση ταχύτητας στο κινητό

## Τι βρήκα μετά από έλεγχο

Η εφαρμογή έχει ήδη καλά basics (lazy loading routes, manual chunks, PWA). Τα κύρια bottlenecks στο κινητό είναι:

1. **Dashboard κατεβάζει ΟΛΟ το ιστορικό προπονήσεων** σε batches των 1000 χωρίς όριο. Σε χρήστες με πολλά logs, αυτό σημαίνει πολλαπλά round-trips στο Supabase πριν εμφανιστεί η σελίδα. Στο 4G/5G κινητό αυτό είναι αισθητό (1-3 δευτ. καθυστέρηση).
2. **Δεν υπάρχει skeleton loader στο πρώτο paint** — ο χρήστης βλέπει «Φόρτωση...» κενό μέχρι να φορτώσει το lazy chunk + τα data, που μοιάζει αργό.
3. **Δεν γίνεται prefetch** σε κρίσιμα routes (Dashboard, Index) όταν ο χρήστης κάνει login.
4. **Service worker δεν κάνει cache τα Supabase API responses** → κάθε φορά που ανοίγει η σελίδα ξαναζητάει τα ίδια data πριν τα δείξει (network-first by default).
5. **Framer Motion page transitions** σε κάθε route μπορεί να καθυστερεί το first interaction στο κινητό, ειδικά σε older devices.
6. **`useQuery` στο Dashboard δεν έχει `gcTime`** ορισμένο, οπότε αν ο χρήστης φύγει και ξαναγυρίσει, ξανατρέχει το βαρύ query.

## Τι θα κάνω (frontend-only, χωρίς να αγγίξω business logic)

### 1. Dashboard: lazy + paginated data load
- Φορτώνω **πρώτο batch (300 πιο πρόσφατα logs)** για instant render — αρκούν για streak, weekly stats, charts του τελευταίου μήνα.
- Τα παλαιότερα logs φορτώνονται **background** μέσω `useQuery` με χαμηλότερη προτεραιότητα (μετά το first paint).
- Προσθέτω `gcTime: 1000 * 60 * 30` για να μένουν τα data στη μνήμη 30 λεπτά.

### 2. Skeleton screens αντί για κενό «Φόρτωση...»
- Αντικατάσταση του `PageLoader` στο `App.tsx` με πραγματικό skeleton που μιμείται το layout (header + cards). Βελτιώνει το **perceived performance** σημαντικά.

### 3. Route prefetching
- Στο Auth success και στο Index, prefetch τα chunks του Dashboard (`import('@/pages/Dashboard')`) ώστε όταν ο χρήστης πατήσει tab να είναι ήδη loaded.

### 4. PWA Service Worker: stale-while-revalidate για Supabase
- Προσθήκη runtime cache στο `vite.config.ts` PWA config για `*.supabase.co/rest/v1/*` με strategy `NetworkFirst` και 5s timeout → fallback στο cache. Αυτό κάνει repeat visits **instant**.

### 5. Mobile-only: μείωση animations
- Στο `PageTransition`, αν `useIsMobile()` και ο χρήστης έχει `prefers-reduced-motion` ή είναι low-end device, μειώνω duration από default σε 150ms ή skip transition.

### 6. Defer heavy components
- Στο Dashboard, τα tabs (`Statistics`, `Progress`) ήδη είναι σε `Tabs` αλλά τα components imports είναι eager. Θα τα κάνω `lazy()` ώστε το Overview tab να εμφανίζεται πιο γρήγορα.

## Τεχνικές λεπτομέρειες (για reference)

- Αρχεία που θα αλλάξουν: `src/pages/Dashboard.tsx`, `src/App.tsx`, `src/components/PageTransition.tsx`, `vite.config.ts`, `src/pages/Auth.tsx`.
- **Δεν αλλάζω** queries logic, καμία αλλαγή στο schema, καμία αλλαγή στο business logic ή στα stats calculations.
- Κρατάω το `useAllWorkoutLogs` ως single source of truth — απλά προσθέτω initial-batch optimization.

## Αναμενόμενο αποτέλεσμα στο κινητό

- **First Contentful Paint**: -40-60% (skeleton instant)
- **Time to Interactive Dashboard**: -50% (300 logs αντί για όλα)
- **Repeat visits**: σχεδόν instant (SW cache)
- **Smooth navigation** μεταξύ tabs (prefetch)
