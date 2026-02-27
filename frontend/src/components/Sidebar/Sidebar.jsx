import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveCommunity } from '../../reducer/feedSlice';
import { FaPlus } from 'react-icons/fa6';

const SidebarWrap = styled.aside`
  position: fixed;
  top: ${({ theme }) => theme.headerHeight};
  left: 0;
  width: ${({ theme }) => theme.sidebarWidth};
  height: calc(100vh - ${({ theme }) => theme.headerHeight});
  background: ${({ theme }) => theme.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.borderColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
  overflow-y: auto;
  z-index: 50;
`;

const SidebarItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition};
  position: relative;
  width: 60px;

  &:hover {
    background: ${({ theme }) => theme.bgHover};
  }

  &.active::before {
    content: '';
    position: absolute;
    left: -2px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    background: ${({ theme }) => theme.accent};
    border-radius: 0 4px 4px 0;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform ${({ theme }) => theme.transition};
`;

const AddBtn = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.bgTertiary};
  border: 2px dashed ${({ theme }) => theme.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.textTertiary};
  font-size: 1rem;
`;

const Label = styled.span`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  line-height: 1.2;
  max-width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Sidebar = () => {
    const dispatch = useDispatch();
    const { communities, activeCommunity } = useSelector((state) => state.feed);

    return (
        <SidebarWrap>
            <SidebarItem>
                <AddBtn><FaPlus /></AddBtn>
            </SidebarItem>
            {communities.map((c) => (
                <SidebarItem
                    key={c.id}
                    className={activeCommunity === c.id ? 'active' : ''}
                    onClick={() => dispatch(setActiveCommunity(c.id))}
                >
                    <Avatar
                        src={`https://ui-avatars.com/api/?name=${c.avatar}&background=${c.color.replace('#', '')}&color=fff&bold=true&size=40`}
                        alt={c.name}
                    />
                    <Label>{c.name}</Label>
                </SidebarItem>
            ))}
        </SidebarWrap>
    );
};

export default Sidebar;
