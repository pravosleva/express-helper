import { useEffect, useRef, useState } from 'react';

type TProps = {
  resValidator: (data: any) => boolean;
  onSuccess: (data: any) => void;
  promise: () => Promise<any>;
};

export const PollingComponent = ({
  resValidator,
  onSuccess,
  promise,
}: TProps) => {
  const timeoutRef = useRef<any>(0);
  const [count, setCount] = useState<number>(0);

  const updateCounterIfNecessary = async () => {
    await promise()
      .then((data) => {
        if (resValidator(data)) onSuccess(data);
        else setCount((c) => c + 1);
      })
      .catch((_err: any) => {
        setCount((c) => c + 1);
      });
  };

  useEffect(() => {
    if (!!timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(updateCounterIfNecessary, 5000);

    if (!!timeoutRef.current)
      return () => {
        clearTimeout(timeoutRef.current);
      };
  }, [count]);

  return null;
  // return <div style={{ border: '1px solid red' }}>POLLING COMPONENT: {count}, {timeoutRef.current}</div>
};
