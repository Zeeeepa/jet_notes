import useTargetRef from "@/features/chat/hooks/useTargetRef";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type IntersectionObserverOptions = IntersectionObserverInit & {
  freezeOnceVisible?: boolean;
};

type Result = [RefObject<Element>, boolean];

const useIntersectionObserver = (
  options: IntersectionObserverOptions = {}
): Result => {
  const { target, targetRef: elementRef } = useTargetRef();
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const observerRef = useRef<null | IntersectionObserver>(null);

  useEffect(() => {
    if (target) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);
        },
        {
          threshold: [0.5],
          ...options,
        }
      );

      observerRef.current.observe(target);

      return () => {
        observerRef.current?.unobserve(target);
      };
    }
  }, [target]);

  return { elementRef, isIntersecting };
};

export default useIntersectionObserver;
