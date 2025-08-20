import logo from "../assets/images/Marriot_Logo.png";

const Logo = () => {
  return (
    <div className="logo w-24 h-24 p-2">
      <a href="/app" target="_blank" rel="noopener noreferrer">
        <img
          src={logo}
          alt="Marriot Logo"
          className="w-full h-full object-contain"
        />
      </a>
    </div>
  );
};

export default Logo;
