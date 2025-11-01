import { BounceLoader } from 'react-spinners';

const Loader = () => {
  return (
    <div className="loader-container">
      <BounceLoader
        color="#1c1ab1"
        size={112}
        loading={true}
      />
    </div>
  );
}

export default Loader;
