"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AURELIAN_SPRITE, AVELINE_BALL_SPRITE, AVELINE_HOME_SPRITE, BALL, BALL_WIDE, TITLE_PAGE } from "@/content/assets";
import { prologue } from "@/content/narration";

type GamePhase = "prologue" | "ball";

export default function Home() {
  const [imageFailed, setImageFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("prologue");
  const [cardIndex, setCardIndex] = useState(0);
  const [ballStep, setBallStep] = useState(0);
  const [ballChoice, setBallChoice] = useState(0);

  const advance = () => {
    if (phase === "ball") {
      setBallStep((current) => Math.min(current + 1, 8));
      return;
    }
    if (cardIndex === prologue.length - 1) {
      setPhase("ball");
      return;
    }
    setCardIndex((current) => current + 1);
  };

  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        advance();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started]);

  if (started && phase === "ball") {
    const ballText = [
      "AVELINE\n\nThis is the most brilliant thing I’ve ever seen. I’ve never seen so many candles, so many chandeliers. Are these flowers real? I have to get closer to feel those curtains.",
      "AURELIAN\n\nYou seem so shocked by everything. Is it your first time at the ball?",
      "AVELINE",
      ballChoice === 0
        ? "AURELIAN\n\nYou were looking at the chandeliers. Not at me, not at the doors, not at who came in with whom. Do you know how rare that is in this room?"
        : "AURELIAN\n\n(laughs) Even the fact that you’d have the audacity to say that to me.",
      "AVELINE",
      ballChoice === 0
        ? "AURELIAN\n\nThen you've been robbed that no one thought to show you a room with a ceiling."
        : "AURELIAN\n\nAurelian. (a pause, waiting for something that doesn't come) …Just Aurelian, then. That's a first, and I find I like it.",
      "AURELIAN\n\nSo tell me about where you’re from. Not the Ministry's version — theirs runs to four lines and one of them is about sheep.",
      "AVELINE",
      ballChoice === 0
        ? "AURELIAN\n\nYou keep something alive that nobody inspects. I have never done one thing in my life that wasn't inspected.What were the flowers again?"
        : "AURELIAN\n\n(laughs) And nobody will. I've signed the roads budget four times and watched it die in a committee four times. (beat) Tell me the name of the road.",
    ][ballStep];

    return (
      <main className="prologue-screen scene-screen" onClick={advance}>
        <Image className="prologue-background" src={ballStep === 0 ? BALL_WIDE : BALL} alt="The imperial ball" fill priority sizes="100vw" />
        {ballStep < 2 ? (
          <Image className="prologue-sprite" src={AVELINE_BALL_SPRITE} alt="Lady Aveline in her ballgown" width={319} height={506} />
        ) : (
          <Image className="aurelian-sprite" src={AURELIAN_SPRITE} alt="Prince Aurelian" width={319} height={506} />
        )}
        <div className="prologue-shade" />
        <section className="narration-box" aria-live="polite">
          {ballStep === 2 || ballStep === 4 || ballStep === 7 ? (
            <>
              <p>{ballText}</p>
              <div className="choice-list">
                {ballStep === 2 ? (
                  <>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setBallChoice(0); setBallStep(3); }}>Oh no, was it obvious?</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setBallChoice(1); setBallStep(3); }}>That’s rude of you to assume, do I know you?</button>
                  </>
                ) : ballStep === 4 ? (
                  <>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setBallChoice(0); setBallStep(5); }}>This is actually my first ball in the capital.</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setBallChoice(1); setBallStep(5); }}>Are you not going to introduce yourself?</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setBallChoice(0); setBallStep(8); }}>There's a greenhouse that I take care of that my mother built. No one cares for it and I work on it every day to keep the phonies alive.</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setBallChoice(1); }}>There’s not much. The roads wash out every spring and nobody has ever come to fix them.</button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <p>{ballText}</p>
              <button className="ornate-button" type="button" onClick={(event) => { event.stopPropagation(); advance(); }}>
                {ballStep === 3 ? "Continue" : "Continue"}
              </button>
            </>
          )}
        </section>
      </main>
    );
  }

  if (started) {
    const card = prologue[cardIndex];

    return (
      <main className="prologue-screen" onClick={advance}>
        <Image className="prologue-background" src={card.background} alt="" fill priority sizes="100vw" />
        {card.overlay ? <Image className="prologue-overlay" src={card.overlay} alt="" width={382} height={265} /> : null}
        {cardIndex === prologue.length - 1 ? (
          <Image className="prologue-sprite" src={AVELINE_HOME_SPRITE} alt="Lady Aveline" width={319} height={506} />
        ) : null}
        <div className="prologue-shade" />
        <section className="narration-box" aria-live="polite">
          <p>{card.text}</p>
          <button className="ornate-button" type="button" onClick={(event) => { event.stopPropagation(); advance(); }}>
            {cardIndex === prologue.length - 1 ? "Continue" : "Next"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="title-screen">
      {imageFailed ? (
        <div className="missing-asset" aria-label="Missing title background">
          <span>title.png</span>
        </div>
      ) : (
        <Image
          className="title-art"
          src={TITLE_PAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="title-vignette" />
      <section className="title-content" aria-labelledby="game-title">
        <p className="title-kicker">A romance fantasy visual novel</p>
        <h1 id="game-title">
          <span>전하, 우리 무슨 사이입니까?</span>
          <small>WHAT ARE WE, YOUR HIGHNESS?</small>
        </h1>
        <button className="ornate-button" type="button" onClick={() => setStarted(true)}>
          Start
        </button>
      </section>
    </main>
  );
}
