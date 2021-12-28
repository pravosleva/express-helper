import { useEffect, useRef, useState } from 'react';

type TProps = {
  resValidator: (data: any) => boolean;
  onSuccess: () => void;
  onFail: (err: any) => void;
  promise: () => Promise<any>;
};

export const PollingComponent = ({
  resValidator,
  onSuccess,
  onFail,
  promise,
}: TProps) => {
  const timeoutRef = useRef<any>(null);
  const [count, setCount] = useState<number>(0);

  const updateCounterIfNecessary = async () => {
    await promise()
      .then((data) => {
        if (resValidator(data)) onSuccess();
        else setCount((c) => c + 1);
      })
      .catch((err: any) => {
        if (!!onFail) onFail(err)
        setCount((c) => c + 1);
      });
  };

  useEffect(() => {
    if (!!timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(updateCounterIfNecessary, 2000);

    if (!!timeoutRef.current)
      return () => {
        clearTimeout(timeoutRef.current);
      };
  }, [count]);

  return null;
  // return <div style={{ border: '1px solid red' }}>POLLING COMPONENT: {count}, {timeoutRef.current}</div>
};
