import { useEffect, useRef, useState } from 'react';

type TProps = {
  resValidator: (data: any) => boolean;
  onSuccess: (data: any) => void;
  promise: () => Promise<any>;
  onFail?: (err: any) => void;
  interval: number;
};

export const PollingComponent = ({
  resValidator,
  onSuccess,
  promise,
  onFail,
  interval,
}: TProps) => {
  const timeoutRef = useRef<any>(0);
  const [count, setCount] = useState<number>(0);

  const updateCounterIfNecessary = async () => {
    await promise()
      .then((data) => {
        if (resValidator(data)) onSuccess(data);
        else setCount((c) => c + 1);
      })
      .catch((err: any) => {
        setCount((c) => c + 1);
        if (!!onFail) onFail(err);
      });
  };

  useEffect(() => {
    if (!!timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(updateCounterIfNecessary, interval);

    if (!!timeoutRef.current)
      return () => {
        clearTimeout(timeoutRef.current);
      };
  }, [count, interval]);

  return null;
  // return <div style={{ border: '1px solid red' }}>POLLING COMPONENT: {count}, {timeoutRef.current}</div>
};
