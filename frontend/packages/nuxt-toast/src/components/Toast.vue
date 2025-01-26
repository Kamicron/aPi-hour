
  configure
})
</script>

<style>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  padding: 12px 16px;
  border-width: 1px;
  border-style: solid;
  cursor: default;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  position: relative;
  width: 100%;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-message-wrapper {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.toast-message {
  display: block;
  width: 100%;
}

.toast-message-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-message-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.toast-close {
  position: absolute;
  right: -8px;
  top: -4px;
  background: none;
  border: none;
  color: currentColor;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
