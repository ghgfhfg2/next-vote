import React, { ReactNode } from "react";
import { Transition, TransitionGroup } from "react-transition-group";
import { useRouter } from "next/router";

const TIMEOUT = 100;
const DELAY = 0;
const getTransitionStyles = {
  entering: {
    position: `absolute`,
    opacity:1,
    transition: `opacity ${TIMEOUT}ms linear, transform ${TIMEOUT}ms linear`,
    transform: `translate3d(100%, 0,0)`
  },
  entered: {
    transition: `opacity ${TIMEOUT}ms linear, transform ${TIMEOUT}ms linear`,
    opacity:1,
    transform: `translate3d(0, 0,0)`
  },
  exiting: {    
    transition: `opacity ${TIMEOUT}ms linear, transform ${TIMEOUT}ms linear`,
    opacity:0,
    transform: `translate3d(0, 0,0)`
  },
};
const AppLayout = ({ children }) => {
  const router = useRouter();
  return (
    <>
      <TransitionGroup style={{ position: "relative",overflow:"hidden" }}>
        <Transition
          key={router.pathname.includes('view') ? router.pathname : null}
          timeout={{
            enter: DELAY,
            exit: DELAY,
          }}
        >
          {(status) => (
            <div
              style={{
                ...getTransitionStyles[status],
              }}
            >
              {children}
            </div>
          )}
        </Transition>
      </TransitionGroup>
    </>
  );
};

export default AppLayout;