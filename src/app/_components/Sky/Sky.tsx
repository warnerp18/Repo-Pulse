import styles from "./Sky.module.css";

const stars = [
  { x: "8%", y: "4%", dur: "9s", delay: "0.5s", len: "150px", id: 1 },
  { x: "42%", y: "2%", dur: "12s", delay: "3s", len: "120px", id: 2 },
  { x: "70%", y: "10%", dur: "10s", delay: "6s", len: "180px", id: 3 },
  { x: "18%", y: "38%", dur: "14s", delay: "8s", len: "110px", id: 4 },
  { x: "88%", y: "30%", dur: "11s", delay: "1.5s", len: "140px", id: 5 },
  { x: "15%", y: "70%", dur: "5s", delay: "0.2s", len: "140px", id: 6 },
];

const Sky = () => {
  return (
    <div className={styles.sky} aria-hidden="true">
      {stars.map((star) => (
        <span
          className={styles.star}
          key={star.id}
          style={
            {
              "--x": star.x,
              "--y": star.y,
              "--dur": star.dur,
              "--delay": star.delay,
              "--len": star.len,
            } as React.CSSProperties
          }
        />
      ))}
      <span className={styles.dust} />
      <span className={styles.dustLg} />
    </div>
  );
};

export default Sky;
