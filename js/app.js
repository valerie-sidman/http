const newTicketBtn = document.querySelector('.btn-adding-ticket');
const newTicketCard = document.querySelector('.new-ticket-card');
const editCard = document.querySelector('.editing-card');
const removeCard = document.querySelector('.remove-card');

function getFullTicket(id, callback) {
  const xhrOpenTicket = new XMLHttpRequest();
  const urlOpenTicket = `https://valerie-sidorova-help-desk.herokuapp.com/?method=ticketById&id=${id}`;
  xhrOpenTicket.open('GET', urlOpenTicket, true);
  xhrOpenTicket.addEventListener('load', () => callback(xhrOpenTicket));
  xhrOpenTicket.send();
}

function updateTickets() {
  const xhr = new XMLHttpRequest();
  const url = 'https://valerie-sidorova-help-desk.herokuapp.com/?method=allTickets';
  xhr.open('GET', url, true);
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      const body = JSON.parse(xhr.response);
      const ticketList = document.querySelector('.ticket-list');
      ticketList.innerHTML = '';
      body.forEach((element) => {
        const ticket = document.createElement('li');
        ticket.setAttribute('id', element.id);
        ticket.classList.add('ticket');
        const date = new Date(Number.parseInt(element.created, 10));
        const year = date.getFullYear();
        const month = `0${date.getMonth() + 1}`;
        const day = `0${date.getDate()}`;
        const hours = `0${date.getHours()}`;
        const minutes = `0${date.getMinutes()}`;
        const seconds = `0${date.getSeconds()}`;
        const formattedTime = `${day.substr(-2)}.${month.substr(-2)}.${year} ${hours.substr(-2)}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
        const ticketBody = `
        <div class="checkbox-title-group">
          <label class="checkbox-group">
            <input class="checkbox" type="checkbox">
            <div class="ticket-content"></div>
          </label>
          <div class="ticket-title">${element.name}</div>
        </div>
        <div class="button-block">
          <div class="time-of-creation">${formattedTime}</div>
          <button class="btn-editing-ticket button" type="submit">&#9998;</button>
          <button class="btn-deleting-ticket button" type="submit">&#10008;</button>
        </div>`;
        ticket.insertAdjacentHTML('afterbegin', ticketBody);
        const checkbox = ticket.querySelector('.checkbox');
        checkbox.checked = (element.status === 'true');
        ticketList.appendChild(ticket);
        // Редактирование тикета
        const editTicketBtn = ticket.querySelector('.btn-editing-ticket');
        editTicketBtn.addEventListener('click', (e) => {
          e.preventDefault();
          editCard.classList.remove('modal-inactive');
          const editName = editCard.querySelector('.short-field');
          editName.value = ticket.querySelector('.ticket-title').textContent;
          const editDescription = editCard.querySelector('.detailed-field');
          getFullTicket(ticket.getAttribute('id'), (xhrOpenTicket) => {
            if (xhrOpenTicket.status === 200) {
              editDescription.value = JSON.parse(xhrOpenTicket.response).description;
            }
          });
          const cancelBtn = editCard.querySelector('.btn-canceling');
          cancelBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            editCard.classList.add('modal-inactive');
          });

          // Отправка данных после редактирования тикета
          const editingCard = editCard.querySelector('.btn-ok');
          editingCard.addEventListener('click', (ev) => {
            ev.preventDefault();
            const xhrEditingCard = new XMLHttpRequest();
            const urlEditingCard = `https://valerie-sidorova-help-desk.herokuapp.com/?method=changeTicket&id=${ticket.getAttribute('id')}`;
            const ticketName = editCard.querySelector('.short-field').value;
            const ticketDescription = editCard.querySelector('.detailed-field').value;

            xhrEditingCard.open('POST', urlEditingCard, true);

            xhrEditingCard.addEventListener('readystatechange', () => {
              if (xhrEditingCard.readyState === 4) {
                if (xhrEditingCard.status === 200) {
                  updateTickets();
                  editCard.classList.add('modal-inactive');
                  editCard.querySelector('.short-field').value = '';
                  editCard.querySelector('.detailed-field').value = '';
                }
              }
            });

            const formData = new FormData();
            formData.append('id', ticket.getAttribute('id'));
            formData.append('name', ticketName);
            formData.append('description', ticketDescription);
            formData.append('status', false);
            formData.append('created', new Date().getTime());

            xhrEditingCard.send(formData);
          });
        });

        // Раскрытие тикета
        const ticketTitle = ticket.querySelector('.ticket-title');
        ticketTitle.addEventListener('click', (ev) => {
          ev.preventDefault();
          if (ticket.querySelector('.ticket-body')) {
            ticket.querySelector('.ticket-body').remove();
          } else {
            getFullTicket(ticket.getAttribute('id'), (xhrOpenTicket) => {
              if (xhrOpenTicket.status === 200) {
                const fullTicket = JSON.parse(xhrOpenTicket.response);
                const fullDescription = `
                <div class="ticket-body">
                  <p class="ticket-description">
                    ${fullTicket.description}
                  </p>
                </div>`;
                ticket.insertAdjacentHTML('beforeend', fullDescription);
              }
            });
          }
        });

        // Удаление тикета
        const delTicketBtn = ticket.querySelector('.btn-deleting-ticket');
        delTicketBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          removeCard.classList.remove('modal-inactive');
          const okBtn = removeCard.querySelector('.btn-ok');
          okBtn.addEventListener('click', (eve) => {
            eve.preventDefault();
            const xhrDelTicket = new XMLHttpRequest();
            const urlDelTicket = `https://valerie-sidorova-help-desk.herokuapp.com/?method=deleteTicket&id=${ticket.getAttribute('id')}`;
            xhrDelTicket.open('GET', urlDelTicket, true);
            xhrDelTicket.addEventListener('load', () => {
              if (xhrDelTicket.status === 200) {
                if (document.getElementById(ticket.getAttribute('id'))) {
                  document.getElementById(ticket.getAttribute('id')).remove();
                  removeCard.classList.add('modal-inactive');
                }
              }
            });
            xhrDelTicket.send();
          });
        });

        // Checkbox
        checkbox.addEventListener('change', () => {
          const xhrEditingCard = new XMLHttpRequest();
          const urlEditingCard = `https://valerie-sidorova-help-desk.herokuapp.com/?method=changeStatus&id=${ticket.getAttribute('id')}`;

          xhrEditingCard.open('GET', urlEditingCard, true);

          xhrEditingCard.addEventListener('readystatechange', () => {
            if (xhrEditingCard.readyState === 4) {
              if (xhrEditingCard.status === 200) {
                updateTickets();
              }
            }
          });

          xhrEditingCard.send();
        });
      });
    }
  });
  xhr.send();
}

updateTickets();

// Создание нового тикета
newTicketBtn.addEventListener('click', (e) => {
  e.preventDefault();
  newTicketCard.classList.remove('modal-inactive');
});

const addingNewTicket = newTicketCard.querySelector('.btn-ok');
addingNewTicket.addEventListener('click', (e) => {
  e.preventDefault();
  const xhr = new XMLHttpRequest();
  const url = 'https://valerie-sidorova-help-desk.herokuapp.com/?method=createTicket';
  const ticketName = newTicketCard.querySelector('.short-field').value;
  const ticketDescription = newTicketCard.querySelector('.detailed-field').value;

  xhr.open('POST', url, true);

  xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 201) {
        updateTickets();
        newTicketCard.classList.add('modal-inactive');
        newTicketCard.querySelector('.short-field').value = '';
        newTicketCard.querySelector('.detailed-field').value = '';
      }
    }
  });
  const formData = new FormData();
  formData.append('id', null);
  formData.append('name', ticketName);
  formData.append('description', ticketDescription);
  formData.append('status', false);
  formData.append('created', new Date().getTime());
  xhr.send(formData);
});

const cancelBtn = newTicketCard.querySelector('.btn-canceling');
cancelBtn.addEventListener('click', (ev) => {
  ev.preventDefault();
  newTicketCard.classList.add('modal-inactive');
  newTicketCard.querySelector('.short-field').value = '';
  newTicketCard.querySelector('.detailed-field').value = '';
});
