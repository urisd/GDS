import styled from 'styled-components';
import { FaBars, FaBell, FaPaperPlane, FaMagnifyingGlass, FaShieldHalved, FaFlask } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const HeaderWrap = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => theme.headerHeight};
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Logo = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textPrimary};
  letter-spacing: -0.5px;
  span {
    color: ${({ theme }) => theme.accent};
    font-style: italic;
  }
`;

const HeaderCenter = styled.div`
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.bgTertiary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 24px;
  padding: 8px 16px;
  transition: border-color ${({ theme }) => theme.transition};

  &:focus-within {
    border-color: ${({ theme }) => theme.accent};
  }

  svg {
    color: ${({ theme }) => theme.textTertiary};
    font-size: 0.85rem;
  }

  input {
    background: none;
    border: none;
    outline: none;
    color: ${({ theme }) => theme.textPrimary};
    font-family: inherit;
    font-size: 0.9rem;
    width: 100%;

    &::placeholder {
      color: ${({ theme }) => theme.textTertiary};
    }
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 4px;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.1rem;
  padding: 8px;
  border-radius: 8px;
  transition: all ${({ theme }) => theme.transition};
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.textPrimary};
    background: ${({ theme }) => theme.bgHover};
  }
`;

const Header = () => {
  return (
    <HeaderWrap>
      <HeaderLeft>
        <IconBtn aria-label="메뉴"><FaBars /></IconBtn>
        <Link to="/"><Logo>댓글 <span>넛지</span></Logo></Link>
      </HeaderLeft>
      <HeaderCenter>
        <SearchBar>
          <FaMagnifyingGlass />
          <input type="text" placeholder="검색" />
        </SearchBar>
      </HeaderCenter>
      <HeaderRight>
        <Link to="/demo"><IconBtn aria-label="데모" title="AI 데모"><FaFlask /></IconBtn></Link>
        <Link to="/admin"><IconBtn aria-label="관리자" title="관리자 모니터링"><FaShieldHalved /></IconBtn></Link>
        <IconBtn aria-label="알림"><FaBell /></IconBtn>
        <IconBtn aria-label="DM"><FaPaperPlane /></IconBtn>
      </HeaderRight>
    </HeaderWrap>
  );
};

export default Header;
